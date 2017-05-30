define(
  'ephox.alloy.demo.DropdownsDemo',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Tabstopping',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.system.Gui',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Dropdown',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.api.ui.SplitDropdown',
    'ephox.alloy.api.ui.TieredMenu',
    'ephox.alloy.demo.DemoSink',
    'ephox.alloy.demo.forms.DemoRenders',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Result',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Class',
    'global!console',
    'global!document'
  ],

  function (
    Behaviour, Keying, Representing, Tabstopping, Attachment, Gui, Button, Container, Dropdown, Input, SplitDropdown, TieredMenu, DemoSink, DemoRenders, HtmlDisplay,
    Arr, Future, Obj, Result, DomEvent, Element, Class, console, document
  ) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Attachment.attachSystem(body, gui);


      var sink = DemoSink.make();

      gui.add(sink);

      var lazySink = function () {
        return Result.value(sink);
      };

      var menuMarkers = DemoRenders.menuMarkers();

      var wDoubleInput = DemoRenders.widgetItem({
        type: 'widget',
        autofocus: true,
        data: {
          value: 'widget1',
          text: 'Widget1'
        },
        widget: Container.sketch({
          dom: {
            classes: [ 'my-widget' ]
          },
          containerBehaviours: Behaviour.derive([
            Keying.config({ mode: 'cyclic' })
          ]),
          components: [
            Input.sketch({ dom: { tag: 'input' } }),
            Input.sketch({ dom: { tag: 'input' } })
          ]
        })

      });

      HtmlDisplay.section(
        gui,
        'Thi is a split-button dropdown',
        SplitDropdown.sketch({
          toggleClass: 'demo-selected',
          dom: {
            tag: 'div'
          },
          components: [
            SplitDropdown.parts().button({
              dom: {
                tag: 'button',
                innerHtml: 'Run'
              },
              uid: 'supplied'
            }),
            SplitDropdown.parts().arrow({
              dom: {
                tag: 'button',
                innerHtml: 'v'
              }
            }),
            SplitDropdown.parts().sink({ })
          ],
          fetch: function () {
            var wMenu = DemoRenders.menu({
              value: 'demo.1.widget.menu',
              items: [ wDoubleInput ]
            });

            return Future.pure(
              TieredMenu.singleData('name', wMenu)
            );
          },
          lazySink: lazySink,
          onExecute: function () {
            console.log('split-dropdown button clicked');
          },
          parts: {
            menu: {
              markers: menuMarkers
            }
          }
        })
      );

      var x = HtmlDisplay.section(
        gui,
        'This dropdown button shows a widget',
        Dropdown.sketch({
          lazySink: lazySink,

          toggleClass: 'demo-selected',

          dom: {
            tag: 'div',
            innerHtml: 'Dropdown widget'
          },

          parts: {
            menu: {
              markers: menuMarkers
            }
          },

          fetch: function () {
            var menu = DemoRenders.menu({
              value: 'demo.2.widget',
              items: [ wDoubleInput ]
            });

            return Future.pure(menu).map(function (m) {
              return TieredMenu.singleData('demo.2.menu', menu);
            });
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This grid dropdown button is a grid of 2 x 2',
        Dropdown.sketch({
          dom: {
            tag: 'div',
            innerHtml: 'here'
          },
          components: [

          ],

          toggleClass: 'demo-selected',

          parts: {
            menu: {
              markers: menuMarkers
            }
          },
          fetch: function () {

            var data = Arr.map([
              { type: 'item', data: { value: 'alpha', text: '+Alpha' } },
              { type: 'item', data: { value: 'beta', text: '+Beta' } },
              { type: 'item', data: { value: 'gamma', text: '+Gamma' } },
              { type: 'item', data: { value: 'delta', text: '+Delta' } }
            ], DemoRenders.gridItem);

            var future = Future.pure(data);
            return future.map(function (items) {
              var menu = DemoRenders.gridMenu({
                value: 'demo.3.menu',
                items: items,
                columns: 2,
                rows: 2
              });
              return TieredMenu.singleData('grid-list', menu);
            });
          },

          lazySink: lazySink
        })
      );

      HtmlDisplay.section(
        gui,
        'This dropdown button has four possible values: alpha, beta, gamma, and delta AND an internal sink',
        Dropdown.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Click me to expand'
          },
          components: [
            Dropdown.parts().sink({ })
          ],

          toggleClass: 'demo-selected',

          parts: {
            menu: {
              markers: menuMarkers
            }
          },
          lazySink: lazySink,

          matchWidth: true,

          fetch: function () {
            var data = Arr.map([
              { type: 'item', data: { value: 'alpha', text: 'Alpha' }, 'item-class': 'class-alpha' },
              { type: 'item', data: { value: 'beta', text: 'Beta' }, 'item-class': 'class-beta' },
              { type: 'separator', data: { value: 'text', text: '-- separator --' } },
              { type: 'item', data: { value: 'gamma', text: 'Gamma' }, 'item-class': 'class-gamma' },
              { type: 'item', data: { value: 'delta', text: 'Delta' }, 'item-class': 'class-delta' }
            ], DemoRenders.item);

            var future = Future.pure(data);
            return future.map(function (items) {
              var menu = DemoRenders.menu({
                value: 'demo.4.menu',
                items: items
              });
              return TieredMenu.singleData('basic-list', menu);
            });
          },
          onExecute: function (sandbox, item, itemValue) {
            console.log('*** dropdown demo execute on: ' + Representing.getValue(item));
          }
        })
      );

      HtmlDisplay.section(
        gui,
        'This dropdown menu has an intricate menu system derived from Sublime sorting',
        Dropdown.sketch({
          dom: {
            tag: 'div',
            innerHtml: '+'
          },
          components: [

          ],
          lazySink: lazySink,
          parts: {
            menu: {
              markers: menuMarkers
            }
          },

          toggleClass: 'demo-selected',

          onExecute: function (sandbox, item, itemValue) {
            console.trace();
            console.log('*** dropdown menu demo execute on: ' + Representing.getValue(item).value + ' ***');
          },
          fetch: function () {
            var future = Future.pure({
              primary: 'tools-menu',
              menus: Obj.map({
                'tools-menu': {
                  value: 'tools-menu',
                  text: 'tools-menu',
                  items: Arr.map([
                    { type: 'item', data: { value: 'packages', text: 'Packages' }, 'item-class': '' },
                    { type: 'item', data: { value: 'about', text: 'About' }, 'item-class': '' },
                    {
                      type: 'widget',
                      data: {
                        value: 'widget',
                        text: 'Widget'
                      },
                      widget: Container.sketch({
                        dom: {
                          tag: 'div'
                        },
                        components: [
                          Input.sketch({
                            dom: {
                              tag: 'input',
                              styles: {
                                display: 'inline-block',
                                width: '50px'
                              }
                            },
                            hasTabstop: true
                          }),
                          Container.sketch({
                            components: [
                              Button.sketch({
                                action: function () { console.log('clicked on a button', arguments); },
                                dom: {
                                  tag: 'button',
                                  innerHtml: '-'
                                },
                                buttonBehaviours: Behaviour.derive([
                                  Tabstopping.revoke()
                                ])
                              }),
                              Button.sketch({
                                action: function () { console.log('clicked on a button', arguments); },
                                dom: {
                                  tag: 'button',
                                  innerHtml: '+'
                                },
                                buttonBehaviours: Behaviour.derive([
                                  Tabstopping.revoke()
                                ])
                              })
                            ],
                            containerBehaviours: Behaviour.derive([
                              Tabstopping.config({ }),
                              Keying.config({
                                mode: 'flow',
                                selector: 'button'
                              })
                            ])
                          })
                        ],
                        containerBehaviours: Behaviour.derive([
                          Keying.config({
                            mode: 'cyclic'
                          })
                        ])
                      })
                    }
                  ], DemoRenders.item)
                },
                'packages-menu': {
                  value: 'packages',
                  text: 'packages',
                  items: Arr.map([
                    { type: 'item', data: { value: 'sortby', text: 'SortBy' }, 'item-class': '' }
                  ], DemoRenders.item)
                },
                'sortby-menu': {
                  value: 'sortby',
                  text: 'sortby',
                  items: Arr.map([
                    { type: 'item', data: { value: 'strings', text: 'Strings' }, 'item-class': '' },
                    { type: 'item', data: { value: 'numbers', text: 'Numbers' }, 'item-class': '' }
                  ], DemoRenders.item)
                },
                'strings-menu': {
                  value: 'strings',
                  text: 'strings',
                  items: Arr.map([
                    { type: 'item', data: { value: 'version', text: 'Versions', html: '<b>V</b>ersions' }, 'item-class': '' },
                    { type: 'item', data: { value: 'alphabetic', text: 'Alphabetic' }, 'item-class': '' }
                  ], DemoRenders.item)
                },
                'numbers-menu': {
                  value: 'numbers',
                  text: 'numbers',
                  items: Arr.map([
                    { type: 'item', data: { value: 'doubled', text: 'Double digits' }, 'item-class': '' }
                  ], DemoRenders.item)
                }
              }, DemoRenders.menu),
              expansions: {
                'packages': 'packages-menu',
                'sortby': 'sortby-menu',
                'strings': 'strings-menu',
                'numbers': 'numbers-menu'
              }
            });

            return future.map(function (f) {
              return TieredMenu.tieredData(f.primary, f.menus, f.expansions);
            });
          }
        })
      );
    };
  }
);