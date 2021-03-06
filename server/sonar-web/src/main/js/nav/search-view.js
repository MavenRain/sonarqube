/*
 * SonarQube, open source software quality management tool.
 * Copyright (C) 2008-2014 SonarSource
 * mailto:contact AT sonarsource DOT com
 *
 * SonarQube is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * SonarQube is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
define([
  'common/selectable-collection-view',
  'templates/nav'
], function (SelectableCollectionView) {

  var $ = jQuery,

      SearchItemView = Marionette.ItemView.extend({
        tagName: 'li',
        template: Templates['nav-search-item'],

        select: function () {
          this.$el.addClass('active');
        },

        deselect: function () {
          this.$el.removeClass('active');
        },

        submit: function () {
          this.$('a')[0].click();
        },

        serializeData: function () {
          return _.extend(Marionette.ItemView.prototype.serializeData.apply(this, arguments), {
            index: this.options.index
          });
        }
      }),

      SearchEmptyView = Marionette.ItemView.extend({
        tagName: 'li',
        template: Templates['nav-search-empty']
      }),

      SearchResultsView = SelectableCollectionView.extend({
        className: 'menu',
        tagName: 'ul',
        itemView: SearchItemView,
        emptyView: SearchEmptyView
      });

  return Marionette.Layout.extend({
    className: 'navbar-search',
    tagName: 'form',
    template: Templates['nav-search'],

    regions: {
      resultsRegion: '.js-search-results'
    },

    events: {
      'submit': 'onSubmit',
      'keydown .js-search-input': 'onKeyDown',
      'keyup .js-search-input': 'debouncedOnKeyUp'
    },

    initialize: function () {
      var that = this;
      this.results = new Backbone.Collection();
      this.favorite = [];
      if (window.SS.user) {
        this.fetchFavorite().always(function () {
          that.resetResultsToDefault();
        });
      } else {
        this.resetResultsToDefault();
      }
      this.resultsView = new SearchResultsView({ collection: this.results });
      this.debouncedOnKeyUp = _.debounce(this.onKeyUp, 400);
      this._bufferedValue = '';
    },

    onRender: function () {
      var that = this;
      this.resultsRegion.show(this.resultsView);
      setTimeout(function () {
        that.$('.js-search-input').focus();
      }, 0);
    },

    onKeyDown: function (e) {
      if (e.keyCode === 38) {
        this.resultsView.selectPrev();
        return false;
      }
      if (e.keyCode === 40) {
        this.resultsView.selectNext();
        return false;
      }
      if (e.keyCode === 13) {
        this.resultsView.submitCurrent();
        return false;
      }
      if (e.keyCode === 27) {
        this.options.hide();
        return false;
      }
    },

    onKeyUp: function () {
      var value = this.$('.js-search-input').val();
      if (value === this._bufferedValue) {
        return;
      }
      this._bufferedValue = this.$('.js-search-input').val();
      if (this.searchRequest != null) {
        this.searchRequest.abort();
      }
      this.searchRequest = this.search(value);
    },

    onSubmit: function () {
      return false;
    },

    fetchFavorite: function () {
      var that = this;
      return $.get(baseUrl + '/api/favourites').done(function (r) {
        that.favorite = r.map(function (f, index) {
          var isFile = ['FIL', 'UTS'].indexOf(f.qualifier) !== -1;
          return {
            url: baseUrl + '/dashboard/index?id=' + encodeURIComponent(f.key) + dashboardParameters(true),
            name: isFile ? window.collapsedDirFromPath(f.lname) + window.fileFromPath(f.lname) : f.name,
            icon: 'favorite',
            extra: index === 0 ? t('favorite') : null
          };
        });
      });
    },

    resetResultsToDefault: function () {
      var recentHistory = JSON.parse(localStorage.getItem('sonar_recent_history')),
          history = (recentHistory || []).map(function (historyItem, index) {
            return {
              url: baseUrl + '/dashboard/index?id=' + encodeURIComponent(historyItem.key) + dashboardParameters(true),
              name: historyItem.name,
              q: historyItem.icon,
              extra: index === 0 ? t('browsed_recently') : null
            };
          }),
          qualifiers = this.model.get('qualifiers').map(function (q, index) {
            return {
              url: baseUrl + '/all_projects?qualifier=' + encodeURIComponent(q),
              name: t('qualifiers.all', q),
              extra: index === 0 ? '' : null
            };
          });
      this.results.reset([].concat(history, _.first(this.favorite, 6), qualifiers));
    },

    search: function (q) {
      if (q.length < 2) {
        this.resetResultsToDefault();
        return;
      }
      var that = this,
          url = baseUrl + '/api/components/suggestions',
          options = { s: q };
      return $.get(url, options).done(function (r) {
        var collection = [];
        r.results.forEach(function (domain) {
          domain.items.forEach(function (item, index) {
            collection.push(_.extend(item, {
              q: domain.q,
              extra: index === 0 ? domain.name : null,
              url: baseUrl + '/dashboard/index?id=' + encodeURIComponent(item.key) + dashboardParameters(true)
            }));
          });
        });
        that.results.reset([].concat(
            that.getNavigationFindings(q),
            that.getGlobalDashboardFindings(q),
            that.getFavoriteFindings(q),
            collection
        ));
      });
    },

    getNavigationFindings: function (q) {
      var DEFAULT_ITEMS = [
            { name: t('issues.page'), url: baseUrl + '/issues/search' },
            { name: t('layout.measures'), url: baseUrl + '/measures/search?qualifiers[]=TRK' },
            { name: t('coding_rules.page'), url: baseUrl + '/coding_rules' },
            { name: t('quality_profiles.page'), url: baseUrl + '/profiles' },
            { name: t('quality_gates.page'), url: baseUrl + '/quality_gates' },
            { name: t('comparison_global.page'), url: baseUrl + '/comparison' },
            { name: t('dependencies.page'), url: baseUrl + '/dependencies' }
          ],
          customItems = [];
      if (window.SS.isUserAdmin) {
        customItems.push({ name: t('layout.settings'), url: baseUrl + '/settings' });
      }
      var findings = [].concat(DEFAULT_ITEMS, customItems).filter(function (f) {
        return f.name.match(new RegExp(q, 'i'));
      });
      if (findings.length > 0) {
        findings[0].extra = t('navigation');
      }
      return _.first(findings, 6);
    },

    getGlobalDashboardFindings: function (q) {
      var dashboards = this.model.get('globalDashboards') || [],
          items = dashboards.map(function (d) {
            return { name: d.name, url: baseUrl + d.url };
          });
      var findings = items.filter(function (f) {
        return f.name.match(new RegExp(q, 'i'));
      });
      if (findings.length > 0) {
        findings[0].extra = t('dashboard.global_dashboards');
      }
      return _.first(findings, 6);
    },

    getFavoriteFindings: function (q) {
      var findings = this.favorite.filter(function (f) {
        return f.name.match(new RegExp(q, 'i'));
      });
      if (findings.length > 0) {
        findings[0].extra = t('favorite');
      }
      return _.first(findings, 6);
    }
  });

});
