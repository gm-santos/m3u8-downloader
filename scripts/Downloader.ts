import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';

import { StatusDownload } from '../src/vite-env';

const ffmpegPath = ffmpegStatic.replace('app.asar', 'app.asar.unpacked');
const ffprobePath = ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked');

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

class Downloader {
  files = [];
  savePath = '';
  status: StatusDownload[] = [];

  onProgressCallback: ((statusList?) => void)[] = [];

  constructor(files, savePath) {
    this.files = files;
    this.savePath = savePath;
    this.status = files.map(() => {
      return {
        status: 'idle',
        percent: 0
      }
    });
  }

  updateProgress = () => {
    this.onProgressCallback.forEach((callback) => {
      callback(this.status);
    })
   }

  onProgress = (callback: (statusList?: StatusDownload[]) => void) => {
    if (!this.onProgressCallback.includes(callback)) {
      this.onProgressCallback.push(callback);
    } else {
      callback(this.status);
    }
  };

  updateStatus = (status: string, current: number, percent?: number) => {
    this.status[current] = {
      status: status,
      percent: percent,
    }
  }

  setVideo = (file, name, index) => {
    const command = new Promise((resolve, reject) => {
      ffmpeg(file, {timeout: 30})
        .on('start', () => {
          this.updateStatus('start', index, 0);
        })
        .on('progress', (data) => {
          this.updateStatus('progress', index, parseInt(data.percent ?? 0));
          this.updateProgress();
        })
        .on("error", (err) => {
          this.updateStatus('error', index);
          reject(err);
        })
        .on("end", () => {
          this.updateStatus('end', index, 100);
          resolve(this.status[index]);
        })
        .outputOptions("-c copy")
        .outputOptions("-bsf:a aac_adtstoasc")
        .output(this.savePath + '/'+ name)
        .run();
    })

    return command;
  }

  start = () => {
    return new Promise((resolve, reject) => {
      const promises = this.files.map((file, idx) => {
        return this.setVideo(file.link, file.name, idx);
      });

      Promise.all(promises)
        .then((results) => {
          console.log('finished success: ', results)
          resolve(results);
        })
        .catch((errors) => {
          console.log('finished errors: ', errors)
          reject(errors)
        });
      })
  }
}

export default Downloader;