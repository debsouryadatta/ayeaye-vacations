# REMI Message Ingestor Architecture

## Summary

For REMI's group-message ingestor I would choose **Twilio Conversations** over raw SMS/MMS webhooks. REMI needs more than a message body: it needs a durable conversation id, participant context, message media, idempotent delivery handling, and a defensible ordering model. Twilio Conversations gives the cleanest platform model for that because messages belong to a `ConversationSid` and each message has a Twilio-managed `Index`.

This repository does not connect to real Twilio credentials. The implementation accepts realistic mock Twilio Conversations `onMessageAdded` webhooks and includes a mock participant snapshot so the entire assignment runs locally.

## Provider Choice: Twilio Conversations

Twilio Conversations natively supports Group MMS. Twilio describes Group MMS as group texting among three or more people, where all participants are visible and each participant can see who authored each message. This maps well to REMI groups such as:

- Host + Cleaner + REMI
- Host + Co-host + Guest + REMI
- Host + Vendor + Contractor + REMI

The main reason to choose Twilio Conversations is ordering. Raw SMS/MMS webhooks from most providers can arrive out of order. Twilio Conversations Message resources include an `index` field. Twilio documents that indexes may skip numbers, but are always in order of when the message was received. That gives REMI a provider-owned ordering key instead of relying on local webhook arrival order.

Sources:

- Twilio Conversations docs: https://www.twilio.com/docs/conversations
- Group Texting in Conversations: https://www.twilio.com/docs/conversations-classic/group-texting
- Conversation Message Resource: https://www.twilio.com/docs/conversations-classic/api/conversation-message-resource
- Conversations Webhooks: https://www.twilio.com/docs/conversations-classic/conversations-webhooks
- Conversation Participant Resource: https://www.twilio.com/docs/conversations-classic/api/conversation-participant-resource
- Media Support: https://www.twilio.com/docs/conversations-classic/media-support-conversations
- Limits: https://www.twilio.com/docs/conversations-classic/conversations-limits

## Group SMS / Group MMS Handling

Group texting over carrier networks is Group MMS. Twilio Conversations supports Group MMS using projected addresses. This means a Twilio number can represent a chat/API participant, while SMS participants continue using their native texting apps.

For REMI, the production setup would look like:

1. Buy MMS-capable Twilio long-code numbers.
2. Create a Twilio Conversation for a property operations group.
3. Add SMS participants for host, cleaner, co-host, guest, vendor, or contractor.
4. Add REMI as a chat/API participant with a projected Twilio address.
5. Configure an `onMessageAdded` webhook.
6. Normalize incoming messages into `RemiMessage`.

## Participant Phone Numbers

The `onMessageAdded` webhook includes the conversation id, message id, author, participant sid, body, message index, timestamp, and media metadata. It does **not** include every participant phone number directly in the webhook payload.

That is acceptable because Twilio Conversations has a real Participant API. In production, the ingestor would fetch or cache:

```txt
GET /v1/Conversations/{ConversationSid}/Participants
```

and map participant bindings into phone numbers. The implementation in this repository uses a mock `ParticipantSnapshot` field in the test payload to represent that production lookup. This keeps the local assignment deterministic without real Twilio credentials.

The normalized `RemiMessage` stores:

- `groupId` / `threadId`: `ConversationSid`
- `providerMessageId`: `MessageSid`
- `senderPhoneNumber`: resolved from `ParticipantSid` and the participant snapshot
- `participantPhoneNumbers`: resolved from the participant snapshot
- `metadata.twilio.messageIndex`: Twilio's ordered message index

## Ordering Model

Ordering is preserved per group by using Twilio's `ConversationSid` and message `Index`.

The webhook handler stores the raw payload and normalized message as a queued row. The worker later claims queued rows ordered by:

```txt
ConversationSid ASC
Twilio message Index ASC
provider timestamp ASC
local receivedAt ASC
```

The worker can process different Conversations concurrently, but it will not process a later known message in the same Conversation while an earlier known message is still queued or processing.

The worker also uses a short stabilization window before claiming brand-new rows. This lets closely delivered out-of-order webhooks land in SQLite first, after which the worker processes them by Twilio `Index`, not arrival order.

For production, if strict reconciliation were required, I would add one more step: before processing a Conversation, fetch recent messages from Twilio's Conversation Message API and reconcile local rows against Twilio's authoritative ordered message list.

## Media Handling

Twilio Conversations media is attached to a message through media resources. Twilio documents that received media is accessed through temporary URLs, invalidated after 300 seconds.

The assignment implementation models that flow as follows:

1. Webhook receives media metadata.
2. Webhook stores a mock stored URL in `RemiMessage.mediaAttachments`.
3. Webhook returns quickly.
4. Worker downloads the temporary media URL asynchronously.
5. Worker saves it under `/tmp/remi-media`.
6. Worker updates the normalized message metadata with the local path.

Production would copy Twilio media into durable object storage such as S3.

## Storage and Queue Design

SQLite is used for both durable message storage and queue state through Prisma.

There is no Redis, BullMQ, SQS, or external worker dependency in this challenge implementation. The database table is the durable queue:

- `QUEUED`: inserted by the webhook route
- `PROCESSING`: claimed by the worker
- `PROCESSED`: worker completed successfully
- `FAILED`: worker exhausted retries

The unique constraint on `provider + providerMessageId` provides idempotency. A second delivery of the same `MessageSid` returns `duplicate_ignored`.

There is also a unique constraint on `provider + conversationSid + twilioMessageIndex`. This guards against provider or fixture inconsistencies where two different messages claim the same ordered position in the same Conversation.

## Why Not the Alternatives

### Telnyx

Telnyx has a clean raw Group MMS webhook shape and includes participant context with fields like `cc`. That is useful. The reason I would not choose it here is ordering: Telnyx documents that webhooks can arrive out of order and recommends sequencing by event timestamp. I did not find a strict per-conversation message index comparable to Twilio Conversations.

Source: https://developers.telnyx.com/docs/messaging/messages/receiving-webhooks

### Twilio Programmable Messaging

Twilio Programmable Messaging is excellent for one-to-one SMS/MMS and exposes `MessageSid`, `From`, `To`, `Body`, and media fields. The issue is that regular messaging webhooks do not provide the managed Conversation model, Participant API, or ordered Conversation message index that REMI benefits from.

Source: https://www.twilio.com/docs/messaging/guides/webhook-request

### Bandwidth

Bandwidth is a strong messaging provider and supports group messaging and media webhooks. It is a credible alternative, but I did not find an ordering model as explicit as Twilio Conversations Message `Index`.

Source: https://dev.bandwidth.com/docs/messaging/webhooks/

### Plivo

Plivo inbound webhooks expose message ids, source/destination numbers, text, type, and media fields. That is enough for simpler SMS/MMS ingestion, but Twilio Conversations gives a better conversation-level model for REMI.

Source: https://www.plivo.com/docs/messaging/api/messages

### Sinch

Sinch supports MMS through Conversation API and exposes media URLs. It is powerful, but its callback-ordering guidance is still less direct than Twilio's per-message Conversation `Index`.

Source: https://developers.sinch.com/docs/conversation/channel-support/mms

## Production Follow-Ups

If this moved beyond the challenge, I would add:

- Twilio request signature validation.
- Real Twilio Participant API lookup with caching.
- Real Twilio Media API temporary URL retrieval.
- A separate worker process and container.
- Dead-letter queue visibility and replay tooling.
- Durable media storage such as S3.
- Phone number to role mapping for host, cleaner, co-host, vendor, guest, and REMI.
- Structured logging and tracing.
- Reconciliation against Twilio's Conversation Message API for strict ordering audits.
