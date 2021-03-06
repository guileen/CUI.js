"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Utils = exports.Utils;
    var Composite = exports.Composite;
    var DisplayObject = exports.DisplayObject;
    var EventDispatcher = exports.EventDispatcher;
    var TouchTarget = exports.TouchTarget;
    var Layout = exports.Layout;


    var Component = Class.create({
        constructor: Component,

        id: null,

        /////////////////////////////////////////////
        // 对象创建后, 以下属性可更改

        left: null,
        top: null,
        right: null,
        bottom: null,
        width: null,
        height: null,

        visible: true,
        alpha: 1,
        scale: 1,
        index: 0,
        zIndex: 0,

        extLeft: 0,
        extRight: 0,
        extTop: 0,
        extBottom: 0,

        layout: null,
        root: null,
        parent: null,

        modal: false,

        displayObject: null,

        /////////////////////////////////////////////
        // 对象创建后, 以下属性不可更改

        centerH: false,
        centerV: false,

        padding: null,
        paddingTop: null,
        paddingRight: null,
        paddingBottom: null,
        paddingLeft: null,

        margin: null,
        marginTop: null,
        marginRight: null,
        marginBottom: null,
        marginLeft: null,


        // relative: "root", // 相对于 root容器 定位, 类似dom的position:absolute
        // relative: "parent", // 相对于 parent容器 定位
        relative: false, // 其他(默认值) :遵循parent容器的layout, left,top按偏移量处理( 类似dom的position:relative )


        backgroundColor: "rgba(200,220,255,1)",
        borderColor: "rgba(30,50,80,1)",
        borderWidth: 2,
        borderImage: null, // { img , ix, iy, iw, ih, top, right, bottom, left }

        ////////////////////////////////////////
        // 以下属性为内部属性, 用户通常不需要关心

        pixel: null,

        // 绝对定位和大小, 单位pixel
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        aabb: null,

        composite: true,
        children: null,
        childrenMap: null,
        needToRecompute: true,


        init: function() {
            this.root = this.root || (this.parent && this.parent.root);
            this.aabb = [];
            this.pixel = {};

            EventDispatcher.apply(this);
            TouchTarget.apply(this);

            if (this.composite) {
                Composite.apply(this);
            }

            this.setParent(this.parent || this.root, true);
            this.setMargin(this.margin || 0);
            this.setPadding(this.padding || 0);

            if (this.composite) {
                this.setLayout(this.layout || Layout.commonLayout);
            }
        },

        setLayout: function(layout) {
            this.layout = layout;
        },

        setParent: function(parent, forceCompute) {
            if (parent && (parent != this.parent || forceCompute)) {
                this.parent = parent;
                this.parent.addChild(this);
                this.needToRecompute = true;
            }
        },
        addChild: function(child) {
            Composite.prototype.addChild.call(this, child);
            this.needToRecompute = true;
        },
        setMargin: function(margin) {
            this.margin = margin;
            this.marginLeft = this.marginLeft === null ? this.margin : this.marginLeft;
            this.marginTop = this.marginTop === null ? this.margin : this.marginTop;
            this.marginRight = this.marginRight === null ? this.margin : this.marginRight;
            this.marginBottom = this.marginBottom === null ? this.margin : this.marginBottom;
        },

        setPadding: function(padding) {
            this.padding = padding;
            this.paddingLeft = this.paddingLeft === null ? this.padding : this.paddingLeft;
            this.paddingTop = this.paddingTop === null ? this.padding : this.paddingTop;
            this.paddingRight = this.paddingRight === null ? this.padding : this.paddingRight;
            this.paddingBottom = this.paddingBottom === null ? this.padding : this.paddingBottom;
        },

        updateAABB: function() {
            this.aabb[0] = this.x - this.extLeft;
            this.aabb[1] = this.y - this.extTop;
            this.aabb[2] = this.x + this.w + this.extRight;
            this.aabb[3] = this.y + this.h + this.extBottom;
        },

        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////
        /////////////////////////////////////////////////////////////////////////////

        setSize: function(width, height) {
            this.width = width;
            this.height = height;
            this.needToRecompute = this.width !== width || this.height !== height;
        },
        setLeft: function(left) {
            if (this.left !== left) {
                this.left = left;
                this.needToRecompute = true;
            }
        },
        setRight: function(right) {
            if (this.right !== right) {
                this.right = right;
                this.needToRecompute = true;
            }
        },
        setTop: function(top) {
            if (this.top !== top) {
                this.top = top;
                this.needToRecompute = true;
            }
        },
        setBottom: function(bottom) {
            if (this.bottom !== bottom) {
                this.bottom = bottom;
                this.needToRecompute = true;
            }
        },

        computeLayout: function(forceCompute) {
            if (this.composite && (this.needToRecompute || forceCompute)) {
                this.layout.compute(this);
                this.needToRecompute = false;
            }
        },

        getChildrenCount: function() {
            return this.composite ? this.children.length : 0;
        },

        isInRegion: function(x, y) {
            var aabb = this.aabb;
            return aabb[0] < x && x < aabb[2] && aabb[1] < y && y < aabb[3];
        },

        checkCollideAABB: function(aabb) {
            var aabb2 = this.aabb;
            return aabb[0] < aabb2[2] && aabb[2] > aabb2[0] && aabb[1] < aabb2[3] && aabb[3] > aabb2[1];
        },

        updateSelf: function(timeStep, now) {

        },
        updateChildren: function(timeStep, now) {
            this.children.forEach(function(child) {
                child.update(timeStep, now);
            });
        },
        update: function(timeStep, now) {
            this.computeLayout();
            this.updateSelf(timeStep, now);
            if (this.composite) {
                this.updateChildren(timeStep, now);
            }
        },

        renderSelf: function(context, timeStep, now) {
            context.fillStyle = this.backgroundColor;
            context.fillRect(this.x, this.y, this.w, this.h);
            context.lineWidth = this.borderWidth;
            context.strokeStyle = this.borderColor;
            context.strokeRect(this.x, this.y, this.w, this.h);
        },
        renderChildren: function(context, timeStep, now) {
            this.children.forEach(function(child) {
                child.render(context, timeStep, now);
            });
        },
        render: function(context, timeStep, now) {
            this.renderSelf(context, timeStep, now);
            if (this.composite) {
                this.renderChildren(context, timeStep, now);
            }
        },

        destructor: function() {
            this.root = null;
            this.parent = null;
            this.layout = null;

            // 不会自动显式的销毁子元素.
            if (this.composite) {
                this.children.forEach(function(child) {
                    child.setParent(child.root);
                })
                this.children = null;
                this.childrenMap = null;
            }
        },
    });

    Component.noop = function() {};
    Component.createRoot = function(viewportWidth, viewportHeight) {
        var root = new Component({
            id: "_root",
            x: 0,
            y: 0,
            w: viewportWidth,
            h: viewportHeight,
            relative: "root",

            updateSelf: Component.noop,
            renderSelf: Component.noop,
            checkTouchSelf: Component.noop,
            viewportWidth: viewportWidth,
            viewportHeight: viewportHeight,
        });
        root.init();
        root.pixel = {
            width: viewportWidth,
            height: viewportHeight,
            paddingLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
        };
        root.aabb = [
            0, 0, viewportWidth, viewportHeight
        ];
        return root;
    };


    exports.Component = Component;

    if (typeof module != "undefined") {
        module.exports = Component;
    }

}(CUI));
