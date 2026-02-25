import { ref } from 'vue'

export function useVoiceRecorder() {
    const isRecording = ref(false)
    const audioBlob = ref<Blob | null>(null)
    let mediaRecorder: MediaRecorder | null = null
    let chunks: Blob[] = []
    const duration = ref(0)
    let interval: any

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(stream)

    chunks = []

    mediaRecorder.ondataavailable = e => {
      chunks.push(e.data)
    }

    mediaRecorder.onstop = () => {
      audioBlob.value = new Blob(chunks, { type: 'audio/webm' })
      clearInterval(interval)
    }

    mediaRecorder.start()
    isRecording.value = true
    interval = setInterval(() => {
    duration.value++
    }, 1000)
  }

  function stop() {
    mediaRecorder?.stop()
    isRecording.value = false
  }

  return {
    isRecording,
    audioBlob,
    start,
    stop
  }
}