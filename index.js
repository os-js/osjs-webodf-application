import osjs from 'osjs';
import {name as applicationName} from './metadata.json';

const register = (core, args, options, metadata) => {
  const proc = core.make('osjs/application', {args, options, metadata});

  proc.createWindow({
    id: 'WebODFWindow',
    title: metadata.title.en_EN,
    dimension: {width: 640, height: 480}
  })
    .on('destroy', () => proc.destroy())
    .render();

  return proc;
};

osjs.register(applicationName, register);
