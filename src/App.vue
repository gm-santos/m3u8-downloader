<script lang="ts">
import { toRaw } from 'vue';

import { StatusDownload } from './vite-env';

export type Data = {
  files: { name: string; link: string, status: string, percent: number }[]
  status: string;
  selectedPath: string;
}

export default {
  name: 'App',
  data() {
    const data: Data = {
      files: [],
      status: 'start',
      selectedPath: ''
    }

    return data;
  },
  mounted() {
    window.electron.onProgress((_event: any, statusList: StatusDownload[]) => {
      this.files = this.updateList(statusList);
    });

    window.electron.onFinish((_event: any, finishList: StatusDownload[]) => {
      this.files = []; //this.updateList(finishList);
      this.selectedPath = '';
    });

    window.electron.onSelectFolder((_event: any, selectedPath: string) => {
      this.selectedPath = selectedPath !== '' ? selectedPath : 'Selecione a pasta'; 
    });
  },
  methods: {
    updateList(list: StatusDownload[]) {
      const rawData = toRaw(this.files);
      const newStatus = list.map((data: any, index: number) => {
        return {
          ...rawData[index],
          status: data.status,
          percent: data.percent
        }
      });

      return newStatus;
    },
    addFile() {
      this.files.push({
        status: 'idle',
        percent: 0,
        name: `arquivo-${this.files.length + 1}.mp4`,
        link: 'https://assets.afcdn.com/video49/20210722/v_645516.m3u8'
      })
    },
    selectFolder() {
      window.electron.selectFolder();
    },
    removeFile(index: number) {
      this.files.splice(index, 1);
    },
    startDownload() {
      window.electron.startDownload(toRaw(this.files), this.selectedPath);
    }
  }
}
</script>

<template>
  <div class="flex-center">
    <ul v-if="files.length" class="list">
      <li :class="`item item-${file.status}`" v-for="(file, index) in files" :key="index">
        <template v-if="file.status === 'idle'">
          <input class="input input-name" type="text" v-model="file.name" />
          <input class="input input-file" type="text" v-model="file.link" />
          <button class="button remove-button" @click="removeFile(index)">
            remover
          </button>
        </template>

        <template v-if="file.status === 'progress'">
          <div class="download">
            <div class="progress-bar" :style="{'width': `${file.percent}%`}"></div>
            <div class="percentage">
              {{file.percent}}%
            </div>
          </div>
        </template>

        <template v-if="file.status === 'end'">
          <div class="finish">
            Arquivo "{{ file.name }}" baixado
          </div>
        </template>
      </li>
    </ul>

    <ul v-else class="instructions">
      <li>Clique em "Nova URL" para adicionar um download</li>
      <li>Selecione uma pasta para salvar o arquivo</li>
      <li>Clique em "Baixar" para começar os downloads</li>
    </ul>

    <div class="footer">
      <button class="button add-button" @click="addFile">
        Nova URL
      </button>
      <button class="button select-button" @click="selectFolder">
        Selecionar Pasta
      </button>
      <button class="button download-button" v-if="files.length && selectedPath !== ''" @click="startDownload">
        Baixar
      </button>
    </div>
  </div>
</template>

<style>
.flex-center {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100vw;
  height: 100vh;
}

.instructions {
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-grow: 1;
  margin: auto;
}

.list {
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  padding: 0;
  width: 100%;
  max-height: 100%;
  overflow: auto;
}

.item + .item {
  margin-top: 1.5rem;
}

.item {
  display: grid;
  grid-template-areas: 'name file remove';
  gap: 0.5rem;
  padding: 0 2rem;
}

.item.item-progress,
.item.item-end {
  grid-template-areas: none;
}

.download {
  position: relative;
  height: 2rem;
  background-color: #FFFFFF;
}

.finish {
  position: relative;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000;
  background: #79bc3e;
}

.percentage {
  content: attr(title);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 1rem;
  color: #000;
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 100%;
  background-color: #C89F39;
  transition: width 0.3s ease-in;
}

.input {
  padding: 0.3rem 0.5rem;
}

.input-name {
  grid-area: name;
}

.input-file {
  grid-area: file;
}

.file {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 100px;
  opacity: 0;
}

.footer {
  background-color: #000;
  padding: 2rem;
  display: grid;
  grid-template-areas: 'add select download';
  justify-content: flex-end;
  gap: 20px;
}

.button {
  position: relative;
  border-radius: 8px;
  border: 1px solid transparent;
  padding: 0.6rem 1.2rem;
  font-size: 1rem;
  font-weight: 500;
  font-family: inherit;
  background-color: #1a1a1a;
  cursor: pointer;
  transition: border-color 0.25s;
  overflow: hidden;
}
.button:hover {
  border-color: #646cff;
}
.button:focus,
.button:focus-visible {
  outline: 4px auto -webkit-focus-ring-color;
}

.button.remove-button {
  grid-area: remove;
}

.button.add-button {
  grid-area: add;
}
.button.select-button {
  grid-area: select;
}
.button.download-button {
  grid-area: download;
}

.download-button {
  width: 100%;
  color: #1a1a1a;
  background: #79bc3e;
}

@media only screen and (max-width: 600px) {
  .footer {
    justify-content: stretch;
    grid-template-areas:
      'add select'
      'download download'
  }

  .item {
    grid-template-areas: 
      'name file'
      'remove remove';
  }
}
</style>
