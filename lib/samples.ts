// Song examples shown on the site. Add an entry only with the customer's
// permission and a file they have approved. Put the audio file in public/samples/.
export type SongSample = {
  title: string
  occasion: string
  style: string
  src: string
}

export const SONG_SAMPLES: SongSample[] = []
