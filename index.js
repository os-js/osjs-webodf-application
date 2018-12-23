import osjs from 'osjs';
import {name as applicationName} from './metadata.json';
import {app, h} from 'hyperapp';
import {Box, BoxContainer, Menubar, MenubarItem} from '@osjs/gui';

const register = (core, args, options, metadata) => {
  const _ = core.make('osjs/locale').translate;
  const vfs = core.make('osjs/vfs');
  const proc = core.make('osjs/application', {args, options, metadata});

  const win = proc.createWindow({
    id: 'WebODFWindow',
    title: metadata.title.en_EN,
    icon: proc.resource(metadata.icon),
    dimension: {width: 640, height: 480}
  });

  const basic = core.make('osjs/basic-application', proc, win, {});

  win.on('drop', (ev, data) => {
    if (data.isFile && data.mime) {
      const found = proc.metadata.mimes.find(m => (new RegExp(m)).test(data.mime));
      if (found) {
        basic.open(data);
      }
    }
  });

  proc.on('destroy', () => basic.destroy());

  win.render($content => {
    const ha = app({
      url: ''
    }, {
      setUrl: url => ({url}),

      load: item => (state, actions) => {
        vfs.url(item)
          .then(url => actions.setUrl(url))
          .catch(error => console.error(error)); // FIXME: Dialog
      },

      menu: ev => (state, actions) => {
        core.make('osjs/contextmenu').show({
          position: ev.target,
          menu: [
            {label: _('LBL_OPEN'), onclick: () => actions.menuOpen()},
            {label: _('LBL_QUIT'), onclick: () => actions.menuQuit()}
          ]
        });
      },

      menuOpen: () => state => basic.createOpenDialog(),
      menuQuit: () => state => proc.destroy()
    }, (state, actions) => {
      return h(Box, {flex: 1, grow: 1}, [
        h(Menubar, {}, [
          h(MenubarItem, {
            onclick: ev => actions.menu(ev)
          }, _('LBL_FILE'))
        ]),
        h(BoxContainer, {
          grow: 1,
          shrink: 1,
          style: {overflow: 'auto'},
          class: 'osjs-gui-box-styled'
        }, [
          h('div', {
            key: state.url,
            oncreate: el => {
              if (state.url) {
                const odfcanvas = new window.odf.OdfCanvas(el);
                odfcanvas.load(state.url);
              }
            }
          })
        ])
      ]);
    }, $content);

    basic.on('open-file', ha.load);
    basic.init();
  });

  return proc;
};

osjs.register(applicationName, register);
