import { ACCEPTED, Dropzone } from 'dropzone';

const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute('content');

Dropzone.options.imagen = {
  dictDefaultMessage: 'Sube tus imagenes aqui',
  acceptedFiles: '.png,.jpg,.jpeg',
  maxFilesize: 5,
  maxFiles: 1,
  parallelUploads: 1,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: 'Borrar Archivo',
  dictMaxFilesExceeded: 'El limite es 1 archivo',
  headers: {
    'CSRF-Token': token,
  },
  paramName: 'imagen',
  init: function () {
    const dropzone = this;
    const btnPublicar = document.querySelector('#publicar');

    btnPublicar.addEventListener('click', function () {
      dropzone.processQueue();
    });

    dropzone.on('queuecomplete', function () {
      console.log('Holaaaaaaaaaaaaaaa');
      if (dropzone.getQueuedFiles().length == 0) {
        console.log('Holaaaaa');
        window.location.href = '/mis-propiedades';
      }
    });
  },
};
