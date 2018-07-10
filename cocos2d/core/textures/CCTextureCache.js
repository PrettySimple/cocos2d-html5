/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

/**
 * cc.textureCache is a singleton object, it's the global cache for cc.Texture2D
 * @class
 * @name cc.textureCache
 */
cc.textureCache = /** @lends cc.textureCache# */{
    _textures: {},
    _textureColorsCache: {},
    _textureKeySeq: (0 | Math.random() * 1000),

    _loadedTexturesBefore: {},

    _persistentTextures: [], // A list of texture that are persistent throughtout the game and that can only be removed at very specific parts of the game
    _texturesToRelease: [], // A list that stores previously persistent textures that can now be safely removed

    //Add a texture to the protected list. Textures in this list will be kept throughtout all screens and are only removed
    //at specific parts of the game
    addTextureToPersistentList : function(p_url)
    {
        if(this._persistentTextures.indexOf(p_url) === -1)
            this._persistentTextures.push(p_url);
    },

    //Mark current persistent list to be deleted. After calling this, previous persistent textures will no longer be protected from deletion
    clearPersistentTextureList : function()
    {
        for(var i = 0, len = this._persistentTextures.length; i < len; i++)
            this._texturesToRelease.push(this._persistentTextures[i]);
        this._persistentTextures = [];
    },

    //Permanently release textures that were once persistent and are now ok to be deleted.
    releasePersistentTexturesList : function()
    {
        var url;
        for(var i = 0, len = this._texturesToRelease.length; i < len; i++)
        {
            url = this._texturesToRelease[i];
            if(this._persistentTextures.indexOf(url) === -1) // Double check that the flagged texture has not been re-added to the persist list 
                this.removeTextureForKey(url);
        }
        this._texturesToRelease = [];
    },

    //Remove all textures that have been loaded up until now
    removeUnusedTextures : function(p_children_list)
    {
        for(var url in this._textures)
        {
            if(this._persistentTextures.indexOf(url) === -1)
            {
                this._textures[url].releaseTexture();
                delete this._textures[url];
            }
        }
    },

    //handleLoadedTexture move to Canvas/WebGL

    _initializingRenderer: function () {
        var selPath;
        //init texture from _loadedTexturesBefore
        var locLoadedTexturesBefore = this._loadedTexturesBefore, locTextures = this._textures;
        for (selPath in locLoadedTexturesBefore) {
            var tex2d = locLoadedTexturesBefore[selPath];
            tex2d.handleLoadedTexture();
            locTextures[selPath] = tex2d;
        }
        this._loadedTexturesBefore = {};
    },

    /**
     * <p>
     *     Returns a Texture2D object given an PVR filename                                                              <br/>
     *     If the file image was not previously loaded, it will create a new CCTexture2D                                 <br/>
     *     object and it will return it. Otherwise it will return a reference of a previously loaded image              <br/>
     *     note: AddPVRTCImage does not support on HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addPVRTCImage: function (filename) {
        cc.log(cc._LogInfos.textureCache_addPVRTCImage);
    },

    /**
     * <p>
     *     Returns a Texture2D object given an ETC filename                                                               <br/>
     *     If the file image was not previously loaded, it will create a new CCTexture2D                                  <br/>
     *     object and it will return it. Otherwise it will return a reference of a previously loaded image                <br/>
     *    note:addETCImage does not support on HTML5
     * </p>
     * @param {String} filename
     * @return {cc.Texture2D}
     */
    addETCImage: function (filename) {
        cc.log(cc._LogInfos.textureCache_addETCImage);
    },

    /**
     * Description
     * @return {String}
     */
    description: function () {
        return "<TextureCache | Number of textures = " + this._textures.length + ">";
    },

    /**
     * Returns an already created texture. Returns null if the texture doesn't exist.
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @deprecated
     * @example
     * //example
     * var key = cc.textureCache.textureForKey("hello.png");
     */
    textureForKey: function (textureKeyName) {
        cc.log(cc._LogInfos.textureCache_textureForKey);
        return this.getTextureForKey(textureKeyName);
    },

    /**
     * Returns an already created texture. Returns null if the texture doesn't exist.
     * @param {String} textureKeyName
     * @return {cc.Texture2D|Null}
     * @example
     * //example
     * var key = cc.textureCache.getTextureForKey("hello.png");
     */
    getTextureForKey: function (textureKeyName) {
        return this._textures[textureKeyName] || this._textures[cc.loader._getAliase(textureKeyName)];
    },

    /**
     * @param {Image} texture
     * @return {String|Null}
     * @example
     * //example
     * var key = cc.textureCache.getKeyByTexture(texture);
     */
    getKeyByTexture: function (texture) {
        for (var key in this._textures) {
            if (this._textures[key] === texture) {
                return key;
            }
        }
        return null;
    },

    _generalTextureKey: function (id) {
        return "_textureKey_" + id;
    },

    /**
     * @param {Image} texture
     * @return {Array}
     * @example
     * //example
     * var cacheTextureForColor = cc.textureCache.getTextureColors(texture);
     */
    getTextureColors: function (texture) {
        var image = texture._htmlElementObj;
        var key = this.getKeyByTexture(image);
        if (!key) {
            if (image instanceof HTMLImageElement)
                key = image.src;
            else
                key = this._generalTextureKey(texture.__instanceId);
        }

        if (!this._textureColorsCache[key])
            this._textureColorsCache[key] = texture._generateTextureCacheForColor();
        return this._textureColorsCache[key];
    },

    /**
     * <p>Returns a Texture2D object given an PVR filename<br />
     * If the file image was not previously loaded, it will create a new Texture2D<br />
     *  object and it will return it. Otherwise it will return a reference of a previously loaded image </p>
     * @param {String} path
     * @return {cc.Texture2D}
     */
    addPVRImage: function (path) {
        cc.log(cc._LogInfos.textureCache_addPVRImage);
    },

    /**
     * <p>Purges the dictionary of loaded textures. <br />
     * Call this method if you receive the "Memory Warning"  <br />
     * In the short term: it will free some resources preventing your app from being killed  <br />
     * In the medium term: it will allocate more resources <br />
     * In the long term: it will be the same</p>
     * @example
     * //example
     * cc.textureCache.removeAllTextures();
     */
    removeAllTextures: function () {
        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if (locTextures[selKey])
                locTextures[selKey].releaseTexture();
        }
        this._textures = {};
    },

    /**
     * Deletes a texture from the cache given a texture
     * @param {Image} texture
     * @example
     * //example
     * cc.textureCache.removeTexture(texture);
     */
    removeTexture: function (texture) {
        if (!texture)
            return;

        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if (locTextures[selKey] === texture) {
                locTextures[selKey].releaseTexture();
                delete(locTextures[selKey]);
            }
        }
    },

    /**
     * Deletes a texture from the cache given a its key name
     * @param {String} textureKeyName
     * @example
     * //example
     * cc.textureCache.removeTexture("hello.png");
     */
    removeTextureForKey: function (textureKeyName) {
        if (textureKeyName == null)
            return;
        var tex = this._textures[textureKeyName];
        if (tex) {
            tex.releaseTexture();
            delete(this._textures[textureKeyName]);
        }
    },

    //addImage move to Canvas/WebGL

    /**
     *  Cache the image data
     * @param {String} path
     * @param {Image|HTMLImageElement|HTMLCanvasElement} texture
     */
    cacheImage: function (path, texture) {
        if (texture instanceof  cc.Texture2D) {
            this._textures[path] = texture;
            return;
        }
        var texture2d = new cc.Texture2D();
        texture2d.initWithElement(texture);
        texture2d.handleLoadedTexture();
        this._textures[path] = texture2d;
    },

    /**
     * <p>Returns a Texture2D object given an UIImage image<br />
     * If the image was not previously loaded, it will create a new Texture2D object and it will return it.<br />
     * Otherwise it will return a reference of a previously loaded image<br />
     * The "key" parameter will be used as the "key" for the cache.<br />
     * If "key" is null, then a new texture will be created each time.</p>
     * @param {HTMLImageElement|HTMLCanvasElement} image
     * @param {String} key
     * @return {cc.Texture2D}
     */
    addUIImage: function (image, key) {
        cc.assert(image, cc._LogInfos.textureCache_addUIImage_2);

        if (key) {
            if (this._textures[key])
                return this._textures[key];
        }

        // prevents overloading the autorelease pool
        var texture = new cc.Texture2D();
        texture.initWithImage(image);
        if (key != null)
            this._textures[key] = texture;
        else
            cc.log(cc._LogInfos.textureCache_addUIImage);
        return texture;
    },

    /**
     * <p>Output to cc.log the current contents of this TextureCache <br />
     * This will attempt to calculate the size of each texture, and the total texture memory in use. </p>
     */
    dumpCachedTextureInfo: function () {
        var count = 0;
        var totalBytes = 0, locTextures = this._textures;

        for (var key in locTextures) {
            var selTexture = locTextures[key];
            count++;
            if (selTexture.getHtmlElementObj() instanceof  HTMLImageElement)
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo, key, selTexture.getHtmlElementObj().src, selTexture.pixelsWidth, selTexture.pixelsHeight);
            else {
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, key, selTexture.pixelsWidth, selTexture.pixelsHeight);
            }
            totalBytes += selTexture.pixelsWidth * selTexture.pixelsHeight * 4;
        }

        var locTextureColorsCache = this._textureColorsCache;
        for (key in locTextureColorsCache) {
            var selCanvasColorsArr = locTextureColorsCache[key];
            for (var selCanvasKey in selCanvasColorsArr) {
                var selCanvas = selCanvasColorsArr[selCanvasKey];
                count++;
                cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_2, key, selCanvas.width, selCanvas.height);
                totalBytes += selCanvas.width * selCanvas.height * 4;
            }

        }
        cc.log(cc._LogInfos.textureCache_dumpCachedTextureInfo_3, count, totalBytes / 1024, (totalBytes / (1024.0 * 1024.0)).toFixed(2));
    },

    _clear: function () {
        this._textures = {};
        this._textureColorsCache = {};
        this._textureKeySeq = (0 | Math.random() * 1000);
        this._loadedTexturesBefore = {};
    }
};

cc.game.addEventListener(cc.game.EVENT_RENDERER_INITED, function () {
    if (cc._renderType === cc.game.RENDER_TYPE_CANVAS) {

        var _p = cc.textureCache;

        _p.handleLoadedTexture = function (url) {
            var locTexs = this._textures;
            //remove judge
            var tex = locTexs[url];
            if (!tex) {
                tex = locTexs[url] = new cc.Texture2D();
                tex.url = url;
            }
            tex.handleLoadedTexture();
        };

        /**
         * <p>Returns a Texture2D object given an file image <br />
         * If the file image was not previously loaded, it will create a new Texture2D <br />
         *  object and it will return it. It will use the filename as a key.<br />
         * Otherwise it will return a reference of a previously loaded image. <br />
         * Supported image extensions: .png, .jpg, .gif</p>
         * @param {String} url
         * @param {Function} cb
         * @param {Object} target
         * @return {cc.Texture2D}
         * @example
         * //example
         * cc.textureCache.addImage("hello.png");
         */
        _p.addImage = function (url, cb, target) {

            cc.assert(url, cc._LogInfos.Texture2D_addImage);

            var locTexs = this._textures;
            //remove judge
            var tex = locTexs[url] || locTexs[cc.loader._getAliase(url)];
            if (tex) {
                if (tex.isLoaded()) {
                    cb && cb.call(target, tex);
                    return tex;
                }
                else {
                    tex.addEventListener("load", function () {
                        cb && cb.call(target, tex);
                    }, target);
                    return tex;
                }
            }

            tex = locTexs[url] = new cc.Texture2D();
            tex.url = url;
            var basePath = cc.loader.getBasePath ? cc.loader.getBasePath() : cc.loader.resPath;
            cc.loader.loadImg(cc.path.join(basePath || "", url), function (err, img) {
                if (err)
                {
                    delete(locTexs[url]);
                    return cb && cb.call(target, null, err);
                }

                if (!cc.loader.cache[url]) {
                    cc.loader.cache[url] = img;
                }
                cc.textureCache.handleLoadedTexture(url);

                var texResult = locTexs[url];
                cb && cb.call(target, texResult);
            });

            return tex;
        };

        _p.addImageAsync = _p.addImage;
        _p=undefined;

    } else if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
        cc.assert(cc.isFunction(cc._tmp.WebGLTextureCache), cc._LogInfos.MissingFile, "TexturesWebGL.js");
        cc._tmp.WebGLTextureCache();
        delete cc._tmp.WebGLTextureCache;
    }
});
