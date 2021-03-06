/****************************************************************************
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

cc.LabelTTF._textAlign = ["left", "center", "right"];
cc.LabelTTF._textBaseline = ["top", "middle", "bottom"];

//check the first character
cc.LabelTTF.wrapInspection = true;

//Support: English French German
//Other as Oriental Language
cc.LabelTTF._wordRex = unicode_hack(/(([0-9\u00A0°()]|\p{L}|\p{Pd}|\p{Ps}|\p{Pe}|\p{Pi}|\p{Pf}|\p{Pc}|\p{Po})+|\S)/);
cc.LabelTTF._symbolRex = /^[!,.:;}\]%\?>、‘“》？。，！]/;
cc.LabelTTF._lastWordRex = unicode_hack(/(([0-9\u00A0°()]|\p{L}|\p{Pd}|\p{Ps}|\p{Pe}|\p{Pi}|\p{Pf}|\p{Pc}|\p{Po})+|\S)$/);
cc.LabelTTF._lastEnglish = unicode_hack(/([0-9\u00A0°()]|\p{L}|\p{Pd}|\p{Ps}|\p{Pe}|\p{Pi}|\p{Pf}|\p{Pc}|\p{Po})+$/);
cc.LabelTTF._firsrEnglish = unicode_hack(/^([0-9\u00A0°()]|\p{L}|\p{Pd}|\p{Ps}|\p{Pe}|\p{Pi}|\p{Pf}|\p{Pc}|\p{Po})/);
cc.LabelTTF._firstSpaces = /^\s*/;

(function () {
    cc.LabelTTF.RenderCmd = function () {
        this._fontClientHeight = 18;
        this._fontStyleStr = "";
        this._shadowColorStr = "rgba(128, 128, 128, 0.5)";
        this._strokeColorStr = "";
        this._fillColorStr = "rgba(255,255,255,1)";
        this._fillColorArray = [];
        this._nbCharDisplay = -1;

        this._fillGradientStops = null;
        this._fillGradientBox = null;

        this._labelCanvas = null;
        this._labelContext = null;
        this._lineWidths = [];
        this._strings = [];
        this._isMultiLine = false;
        this._status = [];
        this._renderingIndex = 0;

        this._lastContext = null;

        this._canUseDirtyRegion = true;
    };
    var proto = cc.LabelTTF.RenderCmd.prototype;
    proto.constructor = cc.LabelTTF.RenderCmd;
    proto._labelCmdCtor = cc.LabelTTF.RenderCmd;

    proto._setFontStyle = function (fontNameOrFontDef, fontSize, fontStyle, fontWeight, fontVariant) {
        if (fontNameOrFontDef instanceof cc.FontDefinition) {
            this._fontStyleStr = fontNameOrFontDef._getCanvasFontStr();
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontNameOrFontDef);
        } else {
            var deviceFontSize = fontSize * cc.view.getDevicePixelRatio();
            this._fontStyleStr = fontStyle + " " + fontVariant + " " + fontWeight + " " + deviceFontSize + "px '" + fontNameOrFontDef + "'";
            this._fontClientHeight = cc.LabelTTF.__getFontHeightByDiv(fontNameOrFontDef, fontSize);
        }
    };

    proto._getFontStyle = function () {
        return this._fontStyleStr;
    };

    proto._getFontClientHeight = function () {
        return this._fontClientHeight;
    };

    proto._updateColor = function () {
        this._setColorsString();
        this._updateTexture();
    };

    proto._setColorsString = function () {
        var locDisplayColor = this._displayedColor, node = this._node,
            locShadowColor = node._shadowColor || this._displayedColor;
        var locStrokeColor = node._strokeColor, locFontFillColor = node._textFillColor;
        var dr = locDisplayColor.r / 255, dg = locDisplayColor.g / 255, db = locDisplayColor.b / 255;

        this._shadowColorStr = "rgba(" + (0 | (dr * locShadowColor.r)) + "," + (0 | ( dg * locShadowColor.g)) + ","
            + (0 | (db * locShadowColor.b)) + "," + node._shadowOpacity + ")";
        this._fillColorStr = "rgba(" + (0 | (dr * locFontFillColor.r)) + "," + (0 | (dg * locFontFillColor.g)) + ","
            + (0 | (db * locFontFillColor.b)) + ", 1)";
        this._strokeColorStr = "rgba(" + (0 | (dr * locStrokeColor.r)) + "," + (0 | (dg * locStrokeColor.g)) + ","
            + (0 | (db * locStrokeColor.b)) + ", 1)";

        if(node._textGradientFillColorData !== null)
            this._setColorGradientData();
        else
            this._fillGradientStops = null;
    };

    proto._setColorGradientData = function()
    {
        var locDisplayColor = this._displayedColor, node = this._node;
        var dr = locDisplayColor.r / 255, dg = locDisplayColor.g / 255, db = locDisplayColor.b / 255;
        var locGradientData = node._textGradientFillColorData;
        var index = 0;
        var locGradientStops = locGradientData.gradientStops;
        var stopCount = locGradientStops.length;
        this._fillGradientStops = [];
        this._fillGradientBox = locGradientData.gradientBox;
        for(var index; index < stopCount; index++)
        {
            var stopData = {};
            stopData.colorStr = "rgba(" + (0 | (dr * locGradientStops[index].color.r)) + "," 
                                        + (0 | (dg * locGradientStops[index].color.g)) + "," 
                                        + (0 | (db * locGradientStops[index].color.b)) + ", 1)";
            stopData.ratio = locGradientStops[index].ratio.toString();
            this._fillGradientStops.push(stopData);
        }
    };

    proto._setColorsArray = function()
    {
        var locDisplayColor = this._displayedColor, node = this._node;
        var dr = locDisplayColor.r / 255, dg = locDisplayColor.g / 255, db = locDisplayColor.b / 255;

        // We need to offset our indexes with carriage returns >_<
        var funcGetFixedIndex = function(p_idx) {
            var txt  = node._string;
            var nbCR = 0;
            var idx  = 0;

            while (idx < p_idx)
            {
                if (txt.charAt(idx) == '\n')
                    nbCR++;
                idx++;
            }

            return(p_idx - nbCR);
        };

        this._fillColorArray = [];
        for (var colorIdx in node._textArrayColors)
        {
            var colorDef = node._textArrayColors[colorIdx];
            var color = {};
            color.col   = "rgba(" + (0 | (dr * colorDef.col.r)) + "," + (0 | (dg * colorDef.col.g)) + ","
                                  + (0 | (db * colorDef.col.b)) + ", 1)";
            color.start = funcGetFixedIndex(colorDef.start);
            color.end   = funcGetFixedIndex(colorDef.end);

            this._fillColorArray.push(color);
        }
    };

    var localBB = new cc.Rect();
    proto.getLocalBB = function () {
        var node = this._node;
        localBB.x = localBB.y = 0;
        var pixelRatio = cc.view.getDevicePixelRatio();
        localBB.width = node._getWidth() * pixelRatio;
        localBB.height = node._getHeight() * pixelRatio;
        return localBB;
    };

    proto._updateTTF = function () {
        var node = this._node;
        var pixelRatio = cc.view.getDevicePixelRatio();
        var locDimensionsWidth = node._dimensions.width * pixelRatio, i, strLength;
        var locLineWidth = this._lineWidths;
        locLineWidth.length = 0;

        this._isMultiLine = false;
        this._measureConfig();
        var textWidthCache = {};
        if (locDimensionsWidth !== 0) {
            // Content processing
            this._strings = node._string.split('\n');

            for (i = 0; i < this._strings.length; i++) {
                this._checkWarp(this._strings, i, locDimensionsWidth);
            }
        } else {
            this._strings = node._string.split('\n');
            for (i = 0, strLength = this._strings.length; i < strLength; i++) {
                if(this._strings[i]) {
                    var measuredWidth = this._measure(this._strings[i]);
                    locLineWidth.push(measuredWidth);
                    textWidthCache[this._strings[i]] = measuredWidth;
                } else {
                    locLineWidth.push(0);
                }
            }
        }

        if (this._strings.length > 1)
            this._isMultiLine = true;

        var locSize, locStrokeShadowOffsetX = 0, locStrokeShadowOffsetY = 0;
        if (node._strokeEnabled)
            locStrokeShadowOffsetX = locStrokeShadowOffsetY = node._strokeSize * 2;
        if (node._shadowEnabled) {
            var locOffsetSize = node._shadowOffset;
            locStrokeShadowOffsetX += Math.abs(locOffsetSize.x) * 2;
            locStrokeShadowOffsetY += Math.abs(locOffsetSize.y) * 2;
        }

        //get offset for stroke and shadow
        if (locDimensionsWidth === 0) {
            if (this._isMultiLine) {
                locSize = cc.size(Math.ceil(Math.max.apply(Math, locLineWidth) + locStrokeShadowOffsetX),
                                  Math.ceil((this._fontClientHeight * pixelRatio * this._strings.length) + locStrokeShadowOffsetY));
            }
            else {
                var measuredWidth = textWidthCache[node._string];
                if(!measuredWidth && node._string) {
                    measuredWidth = this._measure(node._string);
                }
                locSize = cc.size(Math.ceil((measuredWidth ? measuredWidth : 0) + locStrokeShadowOffsetX),
                                  Math.ceil(this._fontClientHeight * pixelRatio + locStrokeShadowOffsetY));
            }
        } else {
            /*if (node._dimensions.height === 0)*/ {
                if (this._isMultiLine)
                    locSize = cc.size(
                        Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX),
                        Math.ceil((node.getLineHeight() * pixelRatio * this._strings.length) + locStrokeShadowOffsetY));
                else
                    locSize = cc.size(
                        Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX),
                        Math.ceil(node.getLineHeight() * pixelRatio + locStrokeShadowOffsetY));
            }/* else {
                //dimension is already set, contentSize must be same as dimension
                locSize = cc.size(
                    Math.ceil(locDimensionsWidth + locStrokeShadowOffsetX),
                    Math.ceil(node._dimensions.height * pixelRatio + locStrokeShadowOffsetY));
            }*/
        }
        if (node._getFontStyle() !== "normal") {    //add width for 'italic' and 'oblique'
            locSize.width = Math.ceil(locSize.width + node._fontSize * 0.3);
        }
        node.setContentSize(locSize);
        node._strokeShadowOffsetX = locStrokeShadowOffsetX;
        node._strokeShadowOffsetY = locStrokeShadowOffsetY;

        // need computing _anchorPointInPoints
        var locAP = node._anchorPoint;
        this._anchorPointInPoints.x = (locStrokeShadowOffsetX * 0.5) + ((locSize.width - locStrokeShadowOffsetX) * locAP.x);
        this._anchorPointInPoints.y = (locStrokeShadowOffsetY * 0.5) + ((locSize.height - locStrokeShadowOffsetY) * locAP.y);
    };

    proto._saveStatus = function () {
        var node = this._node;
        var scale = cc.view.getDevicePixelRatio();
        var locStrokeShadowOffsetX = node._strokeShadowOffsetX, locStrokeShadowOffsetY = node._strokeShadowOffsetY;
        var locContentSizeHeight = node._contentSize.height - locStrokeShadowOffsetY, locVAlignment = node._vAlignment,
            locHAlignment = node._hAlignment;
        var dx = locStrokeShadowOffsetX * 0.5,
            dy = locContentSizeHeight + locStrokeShadowOffsetY * 0.5;
        var xOffset = 0, yOffset = 0, OffsetYArray = [];
        var locContentWidth = node._contentSize.width - locStrokeShadowOffsetX;

        //lineHeight
        var lineHeight = node.getLineHeight() * scale;
        var transformTop = (lineHeight - this._fontClientHeight * scale) / 2;

        if (locHAlignment === cc.TEXT_ALIGNMENT_RIGHT)
            xOffset += locContentWidth;
        else if (locHAlignment === cc.TEXT_ALIGNMENT_CENTER)
            xOffset += locContentWidth / 2;
        else
            xOffset += 0;

        if (this._isMultiLine) {
            var locStrLen = this._strings.length;
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM)
                yOffset = lineHeight - transformTop * 2 + locContentSizeHeight - lineHeight * locStrLen;
            else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_CENTER)
                yOffset = (lineHeight - transformTop * 2) / 2 + (locContentSizeHeight - lineHeight * locStrLen) / 2;

            for (var i = 0; i < locStrLen; i++) {
                var tmpOffsetY = -locContentSizeHeight + (lineHeight * i + transformTop) + yOffset;
                OffsetYArray.push(tmpOffsetY);
            }
        } else {
            if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_BOTTOM) {
                //do nothing
            } else if (locVAlignment === cc.VERTICAL_TEXT_ALIGNMENT_TOP) {
                yOffset -= locContentSizeHeight;
            } else {
                yOffset -= locContentSizeHeight * 0.5;
            }
            OffsetYArray.push(yOffset);
        }
        var tmpStatus = {
            contextTransform: cc.p(dx, dy),
            xOffset: xOffset,
            OffsetYArray: OffsetYArray
        };
        this._status.push(tmpStatus);
    };

    proto._drawTTFInCanvas = function (context) {
        if (!context)
            return;
        var locStatus = this._status.pop();
        context.setTransform(1, 0, 0, 1, locStatus.contextTransform.x, locStatus.contextTransform.y);
        var xOffset = locStatus.xOffset;
        var yOffsetArray = locStatus.OffsetYArray;
        this.drawLabels(context, xOffset, yOffsetArray);
    };

    proto._checkWarp = function (strArr, i, maxWidth) {
        var text = strArr[i];
        var allWidth = this._measure(text);
        if (allWidth > maxWidth && text.length > 1) {

            var fuzzyLen = text.length * ( maxWidth / allWidth ) | 0;
            var tmpText = text.substr(fuzzyLen);
            var width = allWidth - this._measure(tmpText);
            var sLine;
            var pushNum = 0;

            //Increased while cycle maximum ceiling. default 100 time
            var checkWhile = 0;

            //Exceeded the size
            while (width > maxWidth && checkWhile++ < 100) {
                fuzzyLen *= maxWidth / width;
                fuzzyLen = fuzzyLen | 0;
                tmpText = text.substr(fuzzyLen);
                width = allWidth - this._measure(tmpText);
            }

            checkWhile = 0;

            //Find the truncation point
            while (width < maxWidth && checkWhile++ < 100) {
                if (tmpText) {
                    var exec = cc.LabelTTF._wordRex.exec(tmpText);
                    pushNum = exec ? exec[0].length : 1;
                    sLine = tmpText;
                }

                fuzzyLen = fuzzyLen + pushNum;
                tmpText = text.substr(fuzzyLen);
                width = allWidth - this._measure(tmpText);
            }

            fuzzyLen -= pushNum;
            if (fuzzyLen === 0) {
                fuzzyLen = 1;
                sLine = sLine.substr(1);
            }

            var sText = text.substr(0, fuzzyLen), result;

            //symbol in the first
            if (cc.LabelTTF.wrapInspection) {
                if (cc.LabelTTF._symbolRex.test(sLine || tmpText)) {
                    result = cc.LabelTTF._lastWordRex.exec(sText);
                    fuzzyLen -= result ? result[0].length : 0;
                    if (fuzzyLen === 0) fuzzyLen = 1;

                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }

            //To judge whether a English words are truncated
            if (cc.LabelTTF._firsrEnglish.test(sLine)) {
                result = cc.LabelTTF._lastEnglish.exec(sText);
                if (result && sText !== result[0]) {
                    fuzzyLen -= result[0].length;
                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }

            /////////////////////////////////////////////////////////
            //Remove empty spaces at the beginning of a word!
            if (cc.LabelTTF._firstSpaces.test(sLine))
            {
                result = cc.LabelTTF._firstSpaces.exec(sLine);
                if (result && result.length > 0) 
                {
                    fuzzyLen += result[0].length;
                    sLine = text.substr(fuzzyLen);
                    sText = text.substr(0, fuzzyLen);
                }
            }
            /////////////////////////////////////////////////////////

            strArr[i] = sLine || tmpText;
            strArr.splice(i, 0, sText);
        }
    };

    proto.updateStatus = function () {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;
        
        if (locFlag & flags.textDirty)
            this._updateTexture();

        this.originUpdateStatus();
    };

    proto._syncStatus = function (parentCmd) {
        var flags = cc.Node._dirtyFlags, locFlag = this._dirtyFlag;

        if (locFlag & flags.textDirty)
            this._updateTexture();

        this._originSyncStatus(parentCmd);

        if (cc._renderType === cc.game.RENDER_TYPE_WEBGL || locFlag & flags.transformDirty)
            this.transform(parentCmd);
    };

    proto.drawLabels = function (context, xOffset, yOffsetArray) {
        var node = this._node;

        this._lastContext = context;

        //shadow style setup
        if (node._shadowEnabled) {
            var locShadowOffset = node._shadowOffset;
            context.shadowColor = this._shadowColorStr;
            context.shadowOffsetX = locShadowOffset.x;
            context.shadowOffsetY = -locShadowOffset.y;
            context.shadowBlur = node._shadowBlur;
        }

        var locHAlignment = node._hAlignment,
            locVAlignment = node._vAlignment,
            locStrokeSize = node._strokeSize,
            locMiterLimit = node._miterLimit;

        //this is fillText for canvas
        if (context.font !== this._fontStyleStr)
            context.font = this._fontStyleStr;

        if(this._fillGradientStops !== null && this._fillGradientStops.length > 0)
        {
            //Canvas coordinates for cocos are y-flipped so we must adjust our box accordingly.
            //Also the createLinearGradient() takes in (x0, y0), (x1, y1) as parameters so in order
            //for our box to render as expected the cc.rect must match (cc.Rect.x, cc.Rect.width), (cc.Rect.y, cc.Rect.height)
            //which should create the correct tracing line for our gradient
            var gradient = context.createLinearGradient(this._fillGradientBox.x, -this._fillGradientBox.height, this._fillGradientBox.width, -this._fillGradientBox.y);
            var index = 0;
            var stopCount = this._fillGradientStops.length;
            var stopData;
            for(index = 0; index < stopCount; index++)
            {
                stopData = this._fillGradientStops[index];
                gradient.addColorStop(stopData.ratio, stopData.colorStr);
            }
            context.fillStyle = gradient;
        }
        else
        {
            context.fillStyle = this._fillColorStr;
        }

        //stroke style setup
        var locStrokeEnabled = node._strokeEnabled;
        if (locStrokeEnabled) {
            context.lineWidth = locStrokeSize;
            context.strokeStyle = this._strokeColorStr;
            context.miterLimit = locMiterLimit;
            context.lineJoin = 'round';
        }

        context.textBaseline = cc.LabelTTF._textBaseline[locVAlignment];
        context.textAlign = cc.LabelTTF._textAlign[locHAlignment];

        //////////////////////////////////////////////////////
        var nbColors = this._fillColorArray.length;
        if (nbColors > 0)
        {
            //Backup the currently set fill style
            var fillStyle = context.fillStyle;
            var curColorIdx = 0;
            var curColor = null;
            var curIdx = 0;
            var curColorDesc = this._fillColorArray[curColorIdx];
            
            var locStrLen = this._strings.length;
            // cc.log("DISPLAYING " + locStrLen + " lines:")
            for (var i = 0; i < locStrLen; i++) 
            {
                var line = this._strings[i];

                // cc.log(" > " + line);

                var strDisplay = "";
                var xDisplay   = xOffset;
                var startIdx   = curIdx;
                var isFirstInLine = true;

                while((curIdx-startIdx) < line.length)
                {
                    // 
                    if (curColorIdx < nbColors)
                    {
                        if (curIdx > curColorDesc.end)
                        {
                            // We need to look at the next color!
                            // cc.log("NEXT COLOR!");
                            curColorIdx++;
                            curColorDesc = this._fillColorArray[curColorIdx];
                            continue;
                        }
                        else if (curIdx >= curColorDesc.start)
                        {
                            // We need to apply this color!
                            // cc.log("Apply COLOR!");
                            curColor = curColorDesc.col;
                            strDisplay = line.substring(curIdx - startIdx, curColorDesc.end + 1 - startIdx);
                        }
                        else
                        {
                            // We are not YET in a zone to highlight
                            // cc.log("Before COLOR!");
                            curColor = fillStyle;
                            strDisplay = line.substring(curIdx - startIdx, curColorDesc.start - startIdx);
                        }
                    }
                    else
                    {
                        // We don't have anymore zones to highlight
                        // cc.log("No more COLOR!");
                        curColor = fillStyle;
                        strDisplay = line.substring(curIdx - startIdx, line.length+1);
                    }

                    // Only display the first _nbCharDisplay characters, if we activated this
                    var strLength = strDisplay.length;
                    if (this._nbCharDisplay >= 0)
                    {
                        if (curIdx + strDisplay.length > this._nbCharDisplay)
                        {
                            if (curIdx <= this._nbCharDisplay)
                                strDisplay = strDisplay.substring(0, this._nbCharDisplay - curIdx);
                            else
                                strDisplay = "";
                        }
                    }

                    // Display our text
                    if (strDisplay)
                    {
                        context.fillStyle = curColor;
                        var align = context.textAlign;
                        var strWidth = context.measureText(strDisplay).width;

                        if (   context.textAlign == "center" 
                            && strLength != line.length )
                        {
                            // For the "center" alignement, we need a little tweak
                            // We offset the first substring in the line by half the width of the remaining line
                            // And we draw the subsequent substrings with the "left" alignment
                            if (isFirstInLine)
                            {
                                var restOfLine = line.substring(strLength, line.length);
                                xDisplay -= context.measureText(restOfLine).width / 2;
                                strWidth /= 2;
                            }
                            else
                                context.textAlign = "left";
                        }
                        isFirstInLine = false;

                        if (locStrokeEnabled)
                        {
                            var locStrokeOffset = node._strokeOffset;
                            context.strokeText(strDisplay, xDisplay + locStrokeOffset.x, yOffsetArray[i] + locStrokeOffset.y);
                        }
                        context.fillText(strDisplay, xDisplay, yOffsetArray[i]);
                        // cc.log("Display: " + curIdx + "/" + line.length + " > " + strDisplay + " (" + xDisplay + ")");
                    }

                    // Advance our state
                    curIdx   += strLength;
                    xDisplay += strWidth;

                    context.textAlign = align;
                }
            }
            cc.g_NumberOfDraws++;
        }
        else
        {
            var curIdx = 0;
            var locStrLen = this._strings.length;
            for (var i = 0; i < locStrLen; i++) 
            {
                var line = this._strings[i];
                var lineLength = line.length;

                // Only display the first _nbCharDisplay characters, if we actived this
                if (this._nbCharDisplay >= 0)
                {
                    if (curIdx + line.length > this._nbCharDisplay)
                    {
                        if (curIdx <= this._nbCharDisplay)
                            line = line.substring(0, this._nbCharDisplay - curIdx);
                        else
                            line = "";
                    }
                }

                //
                if (locStrokeEnabled)
                {
                    var locStrokeOffset = node._strokeOffset;
                    context.strokeText(line, xOffset + locStrokeOffset.x, yOffsetArray[i] + locStrokeOffset.y);
                }
                context.fillText(line, xOffset, yOffsetArray[i]);

                curIdx += lineLength;
            }
            cc.g_NumberOfDraws++;
        }
        //////////////////////////////////////////////////////
    };

    proto.getTextWidth = function()
    {
        var maxWidth = 0;
        var nbLines  = this._strings.length;
        for (var i=0; i < nbLines; i++)
        {
            var measuredWidth = this._measure(this._strings[i]);
            maxWidth = Math.max(maxWidth, measuredWidth);
        }
        return(maxWidth);
    };

    proto.getTextHeight = function()
    {
        var scale = cc.view.getDevicePixelRatio();
        var node  = this._node;
        return(node.getLineHeight() * scale * this._strings.length);
    };

    proto.getPosFromIndex = function(p_idx)
    {
        var pos = cc.p(0, 0);

        var context = this._lastContext;

        if (context.font !== this._fontStyleStr)
            context.font = this._fontStyleStr;
        context.textBaseline = cc.LabelTTF._textBaseline[this._node._vAlignment];
        context.textAlign = cc.LabelTTF._textAlign[this._node._hAlignment];

        var scale = cc.view.getDevicePixelRatio();
        var lineHeight = this._node.getLineHeight() * scale;

        var halfSpaceWidth = context.measureText(" ").width / 2;

        // Do as if we were going to draw our text, but instead measure it, character by character!
        var curIdx = 0;
        var locStrLen = this._strings.length;
        for (var i = 0; i < locStrLen; i++) 
        {
            var line = this._strings[i];
            var lineWidth = context.measureText(line).width;

            var lineX = - lineWidth / 2;
            var lineY = - lineHeight / 2 - i * lineHeight;

            for (var j = 0; j < line.length; j++)
            {
                lineX += context.measureText(line[j]).width;
                if (curIdx == p_idx)
                {
                    pos.x = lineX + halfSpaceWidth;
                    pos.y = lineY;
                    return(pos);
                }
                curIdx++;
            }
        }

        return(pos);
    };

})();

(function () {
    cc.LabelTTF.CacheRenderCmd = function () {
        this._labelCmdCtor();
        var locCanvas = this._labelCanvas = document.createElement("canvas");
        locCanvas.width = 1;
        locCanvas.height = 1;
        this._labelContext = locCanvas.getContext("2d");
        this._labelContext.imageSmoothingEnabled = true;
    };

    cc.LabelTTF.CacheRenderCmd.prototype = Object.create(cc.LabelTTF.RenderCmd.prototype);
    cc.inject(cc.LabelTTF.RenderCmd.prototype, cc.LabelTTF.CacheRenderCmd.prototype);

    var proto = cc.LabelTTF.CacheRenderCmd.prototype;
    proto.constructor = cc.LabelTTF.CacheRenderCmd;
    proto._cacheCmdCtor = cc.LabelTTF.CacheRenderCmd;

    proto._updateTexture = function () {
        this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.textDirty ^ this._dirtyFlag;
        var node = this._node;
        node._needUpdateTexture = false;
        var locContentSize = node._contentSize;
        this._updateTTF();
        var width = locContentSize.width, height = locContentSize.height;

        var locContext = this._labelContext, locLabelCanvas = this._labelCanvas;

        if (!node._texture) {
            var labelTexture = new cc.Texture2D();
            labelTexture.initWithElement(this._labelCanvas);
            node.setTexture(labelTexture);
        }

        if (node._string.length === 0) {
            locLabelCanvas.width = 1;
            locLabelCanvas.height = locContentSize.height || 1;
            node._texture && node._texture.handleLoadedTexture();
            node.setTextureRect(cc.rect(0, 0, 1, locContentSize.height));
            return true;
        }

        //set size for labelCanvas
        locContext.font = this._fontStyleStr;

        var flag = locLabelCanvas.width === width && locLabelCanvas.height === height;
        locLabelCanvas.width = width;
        locLabelCanvas.height = height;
        if (flag) locContext.clearRect(0, 0, width, height);
        this._saveStatus();
        this._drawTTFInCanvas(locContext);
        node._texture && node._texture.handleLoadedTexture();
        node.setTextureRect(cc.rect(0, 0, width, height));
        return true;
    };

    proto._measureConfig = function () {
        this._labelContext.font = this._fontStyleStr;
    };

    proto._measure = function (text) {
        if (text) {
            return this._labelContext.measureText(text).width;
        } else {
            return 0;
        }
    };
})();

(function () {
    cc.LabelTTF.CacheCanvasRenderCmd = function (renderable) {
        this._spriteCmdCtor(renderable);
        this._cacheCmdCtor();
    };

    var proto = cc.LabelTTF.CacheCanvasRenderCmd.prototype = Object.create(cc.Sprite.CanvasRenderCmd.prototype);
    cc.inject(cc.LabelTTF.CacheRenderCmd.prototype, proto);
    proto.constructor = cc.LabelTTF.CacheCanvasRenderCmd;
})();

(function () {
    cc.LabelTTF.CanvasRenderCmd = function (renderable) {
        this._spriteCmdCtor(renderable);
        this._labelCmdCtor();
    };

    cc.LabelTTF.CanvasRenderCmd.prototype = Object.create(cc.Sprite.CanvasRenderCmd.prototype);
    cc.inject(cc.LabelTTF.RenderCmd.prototype, cc.LabelTTF.CanvasRenderCmd.prototype);

    var proto = cc.LabelTTF.CanvasRenderCmd.prototype;
    proto.constructor = cc.LabelTTF.CanvasRenderCmd;

    proto._measureConfig = function () {
    };

    proto._measure = function (text) {
        if(text) {
            var context = cc._renderContext.getContext();
            context.font = this._fontStyleStr;
            return context.measureText(text).width;
        } else {
            return 0;
        }
    };

    proto._updateTexture = function () {
        this._dirtyFlag = this._dirtyFlag & cc.Node._dirtyFlags.textDirty ^ this._dirtyFlag;
        var node = this._node;
        var locContentSize = node._contentSize;
        this._updateTTF();
        var width = locContentSize.width, height = locContentSize.height;
        if (node._string.length === 0) {
            node.setTextureRect(cc.rect(0, 0, 1, locContentSize.height));
            return true;
        }
        this._saveStatus();
        node.setTextureRect(cc.rect(0, 0, width, height));
        return true;
    };

    proto.rendering = function (ctx) {
        var scaleX = cc.view.getScaleX(),
            scaleY = cc.view.getScaleY();
        var wrapper = ctx || cc._renderContext, context = wrapper.getContext();
        if (!context)
            return;
        var node = this._node;
        wrapper.computeRealOffsetY();
        if (this._status.length <= 0)
            return;
        var locIndex = (this._renderingIndex >= this._status.length) ? this._renderingIndex - this._status.length : this._renderingIndex;
        var status = this._status[locIndex];
        this._renderingIndex = locIndex + 1;

        var locHeight = node._rect.height,
            locX = node._offsetPosition.x,
            locY = -node._offsetPosition.y - locHeight;

        var alpha = (this._displayedOpacity / 255);

        wrapper.setTransform(this._worldTransform, scaleX, scaleY);
        wrapper.setCompositeOperation(this._blendFuncStr);
        wrapper.setGlobalAlpha(alpha);

        wrapper.save();

        if (node._flippedX) {
            locX = -locX - node._rect.width;
            context.scale(-1, 1);
        }
        if (node._flippedY) {
            locY = node._offsetPosition.y;
            context.scale(1, -1);
        }

        var xOffset = status.xOffset + status.contextTransform.x + locX * scaleX;
        var yOffsetArray = [];

        var locStrLen = this._strings.length;
        for (var i = 0; i < locStrLen; i++)
            yOffsetArray.push(status.OffsetYArray[i] + status.contextTransform.y + locY * scaleY);

        this.drawLabels(context, xOffset, yOffsetArray);
        wrapper.restore();
    };
})();
