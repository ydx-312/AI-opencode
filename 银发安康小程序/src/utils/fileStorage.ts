import Taro from '@tarojs/taro'

export function saveTempFile(tempPath: string): string {
  try {
    const fs = Taro.getFileSystemManager()
    const savedPath = fs.saveFileSync(tempPath)
    return savedPath
  } catch {
    return tempPath
  }
}

export function chooseAndSaveImage(count = 1): Promise<string[]> {
  return Taro.chooseImage({ count, sizeType: ['compressed'], sourceType: ['album', 'camera'] }).then((res) =>
    res.tempFilePaths.map(saveTempFile)
  )
}

export function chooseAndSaveVideo(): Promise<string[]> {
  return Taro.chooseVideo({ sourceType: ['album', 'camera'] }).then((res) => {
    return [saveTempFile(res.tempFilePath)]
  })
}
