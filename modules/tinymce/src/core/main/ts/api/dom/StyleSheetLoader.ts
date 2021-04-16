/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Future, Futures, Obj, Result, Results } from '@ephox/katamari';
import { Attribute, Insert, Remove, SelectorFind, SugarElement, SugarShadowDom, Traverse } from '@ephox/sugar';
import Tools from '../util/Tools';
import cssSkin from './HackSkinCss';
import cssContent from './HackContentCss';
import cssGoogle from './HackGoogleCss';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 */

export interface StyleSheetLoader {
  load: (url: string, success: () => void, failure?: () => void) => void;
  loadAll: (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) => void;
  unload: (url: string) => void;
  unloadAll: (urls: string[]) => void;
  _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
}

export interface StyleSheetLoaderSettings {
  maxLoadTime?: number;
  contentCssCors?: boolean;
  referrerPolicy?: ReferrerPolicy;
}

interface StyleState {
  id: string;
  status?: number;
  passed: Array<() => void>;
  failed: Array<() => void>;
  count: number;
}

export function StyleSheetLoader(documentOrShadowRoot: Document | ShadowRoot, settings: StyleSheetLoaderSettings = {}): StyleSheetLoader {
  let idCount = 0;
  const loadedStates: Record<string, StyleState> = {};

  const edos = SugarElement.fromDom(documentOrShadowRoot);
  const doc = Traverse.documentOrOwner(edos);

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    settings.referrerPolicy = referrerPolicy;
  };

  const addStyle = (element: SugarElement<HTMLStyleElement>) => {
    Insert.append(SugarShadowDom.getStyleContainer(edos), element);
  };

  const removeStyle = (id: string) => {
    const styleContainer = SugarShadowDom.getStyleContainer(edos);
    SelectorFind.descendant(styleContainer, '#' + id).each(Remove.remove);
  };

  const getOrCreateState = (url: string) =>
    Obj.get(loadedStates, url).getOrThunk((): StyleState => ({
      id: 'mce-u' + (idCount++),
      passed: [],
      failed: [],
      count: 0
    }));

  /**
   * Loads the specified CSS file and calls the `loadedCallback` once it's finished loading.
   *
   * @method load
   * @param {String} url Url to be loaded.
   * @param {Function} success Callback to be executed when loaded.
   * @param {Function} failure Callback to be executed when failed loading.
   */
  const load = (url: string, success: () => void, failure?: () => void) => {

    /* eslint-disable no-console */
    console.log('t5');
    console.log(url);
  	console.log(cssSkin.length);
  	console.log(cssContent.length);

    const urlWithSuffix = Tools._addCacheSuffix(url);

    const state = getOrCreateState(urlWithSuffix);
    loadedStates[urlWithSuffix] = state;
    state.count++;

    const resolve = (callbacks: Array<() => void>, status: number) => {
      let i = callbacks.length;
      while (i--) {
        console.log('t14');
        console.log(callbacks[i]);
        callbacks[i]();
        console.log('t13');
      }

      state.status = status;
      state.passed = [];
      state.failed = [];
    };

    const passed = () => resolve(state.passed, 2);
    const failed = () => resolve(state.failed, 3);

    if (success) {
      state.passed.push(success);
    }

    if (failure) {
      console.log('t12');
      state.failed.push(failure);
    }

    // Is loading wait for it to pass
    if (state.status === 1) {
      console.log('t11');
      return;
    }

    // Has finished loading and was success
    if (state.status === 2) {
      passed();
      return;
    }

    // Has finished loading and was a failure
    if (state.status === 3) {
      console.log('t10');
      failed();
      return;
    }

    // Start loading
    state.status = 2;
    const styleElem = SugarElement.fromTag('style', doc.dom);
    Attribute.setAll(styleElem, {
      type: 'text/css'
    });

    const style = styleElem.dom;

    if (urlWithSuffix.match(/content.min.css/)) {
      console.log('t9');
      style.innerHTML = cssContent;
    } else if (urlWithSuffix.match(/skin.min.css/)) {
      console.log('t8');
      style.innerHTML = cssSkin;
    } else if (urlWithSuffix.match(/css2/)) {
      console.log('t888');
      style.innerHTML = cssGoogle;
    }

    console.log('t7');
    addStyle(styleElem);
    console.log('t6');

  };

  const loadF = (url: string): Future<Result<string, string>> =>
    Future.nu((resolve) => {
      console.log('t5');
      load(
        url,
        Fun.compose(resolve, Fun.constant(Result.value(url))),
        Fun.compose(resolve, Fun.constant(Result.error(url)))
      );
    });

  /**
   * Loads the specified CSS files and calls the `success` callback once it's finished loading.
   *
   * @method loadAll
   * @param {Array} urls URLs to be loaded.
   * @param {Function} success Callback to be executed when the style sheets have been successfully loaded.
   * @param {Function} failure Callback to be executed when the style sheets fail to load.
   */
  const loadAll = (urls: string[], success: (urls: string[]) => void, failure: (urls: string[]) => void) => {
    console.log('t4');
    Futures.par(Arr.map(urls, loadF)).get((result) => {
      const parts = Arr.partition(result, (r) => r.isValue());
      if (parts.fail.length > 0) {
        console.log('t2');
        failure(parts.fail.map(Results.unite));
      } else {
        console.log('t3');
        success(parts.pass.map(Results.unite));
      }
    });
  };

  /**
   * Unloads the specified CSS file if no resources currently depend on it.
   *
   * @method unload
   * @param {String} url URL to unload or remove.
   */
  const unload = (url: string) => {
    console.log('t1');
    const urlWithSuffix = Tools._addCacheSuffix(url);
    Obj.get(loadedStates, urlWithSuffix).each((state) => {
      const count = --state.count;
      if (count === 0) {
        delete loadedStates[urlWithSuffix];
        removeStyle(state.id);
      }
    });
  };

  /**
   * Unloads each specified CSS file if no resources currently depend on it.
   *
   * @method unloadAll
   * @param {Array} urls URLs to unload or remove.
   */
  const unloadAll = (urls: string[]) => {
    Arr.each(urls, (url) => {
      unload(url);
    });
  };

  return {
    load,
    loadAll,
    unload,
    unloadAll,
    _setReferrerPolicy
  };
}
