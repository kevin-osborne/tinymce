/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Future, Futures, Result } from '@ephox/katamari';
import { ReferrerPolicy } from '../api/SettingsTypes';
import Tools from '../api/util/Tools';

/**
 * This class handles loading of external stylesheets and fires events when these are loaded.
 *
 * @class tinymce.dom.StyleSheetLoader
 * @private
 */

export interface StyleSheetLoader {
  load: (url: string, loadedCallback: Function, errorCallback?: Function) => void;
  loadAll: (urls: string[], success: Function, failure: Function) => void;
  _setReferrerPolicy: (referrerPolicy: ReferrerPolicy) => void;
}

export interface StyleSheetLoaderSettings {
  maxLoadTime: number;
  contentCssCors: boolean;
  referrerPolicy: ReferrerPolicy;
}

export function StyleSheetLoader(document, settings: Partial<StyleSheetLoaderSettings> = {}): StyleSheetLoader {
  const loadedStates = {};

  const _setReferrerPolicy = (referrerPolicy: ReferrerPolicy) => {
    settings.referrerPolicy = referrerPolicy;
  };

  /**
   * Loads the specified css style sheet file and call the loadedCallback once it's finished loading.
   *
   * @method load
   * @param {String} url Url to be loaded.
   * @param {Function} loadedCallback Callback to be executed when loaded.
   * @param {Function} errorCallback Callback to be executed when failed loading.
   */
  const load = function (url: string, loadedCallback: Function, errorCallback?: Function) {
    let link, state;

    const resolve = (status: number) => {
      state.status = status;
      state.passed = [];
      state.failed = [];

      if (link) {
        link.onload = null;
        link.onerror = null;
        link = null;
      }
    };

    const passed = function () {
      const callbacks = state.passed;
      let i = callbacks.length;

      while (i--) {
        callbacks[i]();
      }

      resolve(2);
    };

    const failed = function () {
      const callbacks = state.failed;
      let i = callbacks.length;

      while (i--) {
        callbacks[i]();
      }

      resolve(3);
    };

    url = Tools._addCacheSuffix(url);

    if (!loadedStates[url]) {
      state = {
        passed: [],
        failed: []
      };

      loadedStates[url] = state;
    } else {
      state = loadedStates[url];
    }

    if (loadedCallback) {
      state.passed.push(loadedCallback);
    }

    if (errorCallback) {
      state.failed.push(errorCallback);
    }

    // Is loading wait for it to pass
    if (state.status === 1) {
      return;
    }

    // Has finished loading and was success
    if (state.status === 2) {
      passed();
      return;
    }

    // Has finished loading and was a failure
    if (state.status === 3) {
      failed();
      return;
    }

    // Start loading
    state.status = 2;
  };

  const loadF = function (url) {
    return Future.nu(function (resolve) {
      load(
        url,
        Fun.compose(resolve, Fun.constant(Result.value(url))),
        Fun.compose(resolve, Fun.constant(Result.error(url)))
      );
    });
  };

  const unbox = function (result) {
    return result.fold(Fun.identity, Fun.identity);
  };

  const loadAll = function (urls: string[], success: Function, failure: Function) {
    Futures.par(Arr.map(urls, loadF)).get(function (result) {
      const parts = Arr.partition(result, function (r) {
        return r.isValue();
      });

      if (parts.fail.length > 0) {
        failure(parts.fail.map(unbox));
      } else {
        success(parts.pass.map(unbox));
      }
    });
  };

  return {
    load,
    loadAll,
    _setReferrerPolicy
  };
}
