"use strict";

var CUI = CUI || {};

(function(exports) {

    var Class = exports.Class;
    var Component = exports.Component;

    var Button = Class.create({

        composite: false,
        disabled: false,
        // TODO
        initStates: function() {
            this.normalState = {}
            this.downState = { };
            this.disabledState = {

            };
            this.state = this.normalState;
        },

        // TODO
        // render: function(context, timeStep, now) {

        // },

        onTouchStart: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.downState;

        },

        onTouchMove: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            if (!this.isInRegion(x, y)) {
                this.state = this.normalState;
                return false;
            }
        },

        onTouchEnd: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.normalState;
        },

        onTap: function(x, y, id) {
            if (this.disabled) {
                return false;
            }
            this.state = this.normalState;
        },

    }, Component);


    exports.Button = Button;

    if (typeof module != "undefined") {
        module.exports = Button;
    }

}(CUI));
