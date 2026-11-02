// Push notification to the owner's phone via ntfy (https://ntfy.sh).
// Set NTFY_TOPIC to a long random topic name and subscribe to it in the ntfy app.
export async function pushNotify(title: string, message: string, tags = 'musical_note') {
  const topic = process.env.NTFY_TOPIC
  if (!topic) return
  try {
    await fetch(`https://ntfy.sh/${encodeURIComponent(topic)}`, {
      method: 'POST',
      headers: { Title: title, Tags: tags, Priority: 'high' },
      body: message,
    })
  } catch (error) {
    console.error('push notification failed', error)
  }
}
