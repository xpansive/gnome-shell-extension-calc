/**
    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
**/

const St = imports.gi.St;
const Main = imports.ui.main;
const Search = imports.ui.search;
const SearchDisplay = imports.ui.searchDisplay;
const IconGrid = imports.ui.iconGrid;

const MAX_SEARCH_RESULTS_ROWS = 1;
const ICON_SIZE = 81;

let calcProvider = "";

function CalcResult(result) {
    this._init(result);
}

CalcResult.prototype = {
    _init: function(resultMeta) {

        this.actor = new St.Bin({ style_class: 'contact',
                                  reactive: true,
                                  track_hover: true });

        let content = new St.BoxLayout( { style_class: 'contact-content',
                                          vertical: false });
        this.actor.set_child(content);

        let icon = new St.Icon({ icon_type: St.IconType.FULLCOLOR,
                                 icon_size: ICON_SIZE,
                                 icon_name: 'accessories-calculator',
                                 style_class: 'contact-icon' });

        content.add(icon, { x_fill: true,
                            y_fill: false,
                            x_align: St.Align.START,
                            y_align: St.Align.MIDDLE });

        let result = new St.BoxLayout({ style_class: 'contact-details',
                                        vertical: true });

        content.add(result, { x_fill: true, x_align: St.Align.START });

        let exprLabel = new St.Label({ text: resultMeta.expr,
                                         style_class: 'result-expr' });
        let resultLabel = new St.Label({ text: resultMeta.result,
                                         style_class: 'result-result' });

        result.add(exprLabel, { x_fill: false, x_align: St.Align.START });
        result.add(resultLabel, { x_fill: false, x_align: St.Align.START });
    }

};

function CalcProvider() {
    this._init.apply(this, arguments);
}

CalcProvider.prototype = {
    __proto__: Search.SearchProvider.prototype,

    _init: function(title) {
        Search.SearchProvider.prototype._init.call(this, title);
    },

    getInitialResultSet: function(terms) { 
        let expr = terms.join('');
        if (/^[0-9,><.*+/^&|%()-~eE]|sin|cos|abs|acos|asin|atan|atan2|ceil|exp|floor|log|max|min|pow|random|round|sqrt|tan|E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2+$/.test(expr)) {
            try {
                let output = eval("with(Math)" + expr);
                if (typeof output != 'number') {
                    return [];
                }
                return [{'expr': expr, 'result': output.toString()}];
            }
            catch(exp) {
                return [];
            } 
        }
        else {
            return [];
        }
    },

    getSubsearchResultSet: function(prevResults, terms) {
        return this.getInitialResultSet(terms);
    },

    getResultMeta: function(result) {
        return {
            'id': 0,
            'result': result.result,
            'expr': result.expr
        };
    },

    createResultActor: function(resultMeta, terms) {
        let result = new CalcResult(resultMeta);
        return result.actor;
    },

    createResultContainerActor: function() {
        let grid = new IconGrid.IconGrid({ rowLimit: MAX_SEARCH_RESULTS_ROWS,
                                           xAlign: St.Align.START });
        grid.actor.style_class = 'contact-grid';

        let actor = new SearchDisplay.GridSearchResults(this, grid);
        return actor;
    },

    activateResult: function(resultId) {
        return true;
    }
}

function init() {
    calcProvider = new CalcProvider('CALCULATOR');
}

function enable() {
    Main.overview.addSearchProvider(calcProvider);
}

function disable() {
    Main.overview.removeSearchProvider(calcProvider);
}
