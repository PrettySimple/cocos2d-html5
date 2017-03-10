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

cc._tmp.PrototypeCCNode = function () {

    var _p = cc.Node.prototype;

    cc.defineGetterSetter(_p, "x", _p.getPositionX, _p.setPositionX);
    cc.defineGetterSetter(_p, "y", _p.getPositionY, _p.setPositionY);
    /** @export */
    _p.width;
    cc.defineGetterSetter(_p, "width", _p._getWidth, _p._setWidth);
    /** @export */
    _p.height;
    cc.defineGetterSetter(_p, "height", _p._getHeight, _p._setHeight);
    /** @export */
    _p.anchorX;
    cc.defineGetterSetter(_p, "anchorX", _p._getAnchorX, _p._setAnchorX);
    /** @export */
    _p.anchorY;
    cc.defineGetterSetter(_p, "anchorY", _p._getAnchorY, _p._setAnchorY);
    /** @export */
    _p.skewX;
    cc.defineGetterSetter(_p, "skewX", _p.getSkewX, _p.setSkewX);
    /** @export */
    _p.skewY;
    cc.defineGetterSetter(_p, "skewY", _p.getSkewY, _p.setSkewY);
    /** @export */
    _p.zIndex;
    cc.defineGetterSetter(_p, "zIndex", _p.getLocalZOrder, _p.setLocalZOrder);
    /** @export */
    _p.vertexZ;
    cc.defineGetterSetter(_p, "vertexZ", _p.getVertexZ, _p.setVertexZ);
    /** @export */
    _p.rotation;
    cc.defineGetterSetter(_p, "rotation", _p.getRotation, _p.setRotation);
    /** @export */
    _p.rotationX;
    cc.defineGetterSetter(_p, "rotationX", _p.getRotationX, _p.setRotationX);
    /** @export */
    _p.rotationY;
    cc.defineGetterSetter(_p, "rotationY", _p.getRotationY, _p.setRotationY);
    /** @export */
    _p.scale;
    cc.defineGetterSetter(_p, "scale", _p.getScale, _p.setScale);
    /** @export */
    _p.scaleX;
    cc.defineGetterSetter(_p, "scaleX", _p.getScaleX, _p.setScaleX);
    /** @export */
    _p.scaleY;
    cc.defineGetterSetter(_p, "scaleY", _p.getScaleY, _p.setScaleY);
    /** @export */
    _p.children;
    cc.defineGetterSetter(_p, "children", _p.getChildren);
    /** @export */
    _p.childrenCount;
    cc.defineGetterSetter(_p, "childrenCount", _p.getChildrenCount);
    /** @export */
    _p.parent;
    cc.defineGetterSetter(_p, "parent", _p.getParent, _p.setParent);
    /** @export */
    _p.visible;
    cc.defineGetterSetter(_p, "visible", _p.isVisible, _p.setVisible);
    /** @export */
    _p.running;
    cc.defineGetterSetter(_p, "running", _p.isRunning);
    /** @export */
    _p.ignoreAnchor;
    cc.defineGetterSetter(_p, "ignoreAnchor", _p.isIgnoreAnchorPointForPosition, _p.ignoreAnchorPointForPosition);
    /** @export */
    _p.tag;
    /** @export */
    _p.userData;
    /** @export */
    _p.userObject;
    /** @export */
    _p.arrivalOrder;
    /** @export */
    _p.actionManager;
    cc.defineGetterSetter(_p, "actionManager", _p.getActionManager, _p.setActionManager);
    /** @export */
    _p.scheduler;
    cc.defineGetterSetter(_p, "scheduler", _p.getScheduler, _p.setScheduler);
    //cc.defineGetterSetter(_p, "boundingBox", _p.getBoundingBox);
    /** @export */
    _p.shaderProgram;
    cc.defineGetterSetter(_p, "shaderProgram", _p.getShaderProgram, _p.setShaderProgram);

    /** @export */
    _p.opacity;
    cc.defineGetterSetter(_p, "opacity", _p.getOpacity, _p.setOpacity);
    /** @export */
    _p.opacityModifyRGB;
    cc.defineGetterSetter(_p, "opacityModifyRGB", _p.isOpacityModifyRGB);
    /** @export */
    _p.cascadeOpacity;
    cc.defineGetterSetter(_p, "cascadeOpacity", _p.isCascadeOpacityEnabled, _p.setCascadeOpacityEnabled);
    /** @export */
    _p.color;
    cc.defineGetterSetter(_p, "color", _p.getColor, _p.setColor);
    /** @export */
    _p.cascadeColor;
    cc.defineGetterSetter(_p, "cascadeColor", _p.isCascadeColorEnabled, _p.setCascadeColorEnabled);
    
    _p=undefined;
};