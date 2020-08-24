type __task = () => Promise<any>

const pollingTaskIds = {}

export function unpolling(id) {
  pollingTaskIds[id] && clearTimeout(pollingTaskIds[id])
}

export function polling(task: __task, interval: number, id: string, runImmediately?: boolean) {
  unpolling(id)
  runImmediately && task()
  pollingTaskIds[id] = setTimeout(() => {
    task().then(polling(task, interval, id))
  }, interval)
  return null
}