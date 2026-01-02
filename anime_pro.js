(function () {
    'use strict';

    function AnimeComponent(object) {
        var scroll;
        var html = $('<div class="category-full"></div>');
        var active_tab = (object && object.tab) || 'popular';

        var categories = {
            ongoing: {
                path: 'discover/tv',
                params: {
                    with_genres: 16,
                    with_original_language: 'ja',
                    sort_by: 'popularity.desc'
                }
            },
            watching: {
                path: 'trending/tv/day',
                params: {}
            },
            popular: {
                path: 'discover/tv',
                params: {
                    with_genres: 16,
                    with_original_language: 'ja',
                    sort_by: 'popularity.desc'
                }
            },
            top100: {
                path: 'discover/tv',
                params: {
                    with_genres: 16,
                    with_original_language: 'ja',
                    sort_by: 'vote_average.desc',
                    vote_count_gte: 1000
                }
            },
            adult: {
                path: 'discover/tv',
                params: {
                    with_genres: 16,
                    include_adult: true,
                    sort_by: 'popularity.desc'
                }
            }
        };

        this.create = function () {
            var _this = this;
            scroll = new Lampa.Scroll({ mask: true, over: true });

            this.buildTabs();
            scroll.append(html);
            this.load();

            return scroll.render();
        };

        this.buildTabs = function () {
            var _this = this;

            var tabs = [
                { title: 'Онгоинги', id: 'ongoing' },
                { title: 'Сейчас смотрят', id: 'watching' },
                { title: 'Популярное', id: 'popular' },
                { title: 'Топ 100', id: 'top100' },
                { title: '18+', id: 'adult' }
            ];

            var wrap = $('<div class="category-tabs"></div>');

            tabs.forEach(function (tab) {
                var btn = $('<div class="category-tabs__item selector">' + tab.title + '</div>');
                if (tab.id === active_tab) btn.addClass('active');

                btn.on('click', function () {
                    if (active_tab === tab.id) return;
                    active_tab = tab.id;
                    wrap.find('.active').removeClass('active');
                    btn.addClass('active');
                    _this.load();
                });

                wrap.append(btn);
            });

            scroll.append(wrap);
        };

        this.load = function () {
            var _this = this;
            html.empty();
            Lampa.Loading.start();

            var cfg = categories[active_tab];

            Lampa.TMDB.get(cfg.path, cfg.params, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty();
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty();
            });
        };

        this.build = function (results) {
            html.empty();

            results.forEach(function (item) {
                if (!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.TMDB.image(item.poster_path),
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();

                card.on('click', function () {
                    Lampa.Activity.push({
                        component: 'full',
                        method: 'tv',
                        id: item.id,
                        card: item,
                        title: item.name || item.original_name
                    });
                });

                html.append(card.render());
            });

            Lampa.Controller.enable('content');
        };

        this.empty = function () {
            html.html('<div class="empty">В этой категории ничего нет</div>');
        };

        this.render = function () {
            return scroll.render();
        };

        this.destroy = function () {
            if (scroll) scroll.destroy();
        };
    }

    Lampa.Component.add('anime_catalog', AnimeComponent);

    function inject() {
        if ($('.menu [data-action="anime_catalog"]').length) return;

        var list = $('.menu .menu__list');
        if (!list.length) return;

        var item = $('<div class="menu__item selector" data-action="anime_catalog">' +
            '<div class="menu__ico">🎌</div>' +
            '<div class="menu__text">Аниме</div>' +
        '</div>');

        item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме',
                component: 'anime_catalog'
            });
        });

        var tv = list.find('[data-action="tv"]');
        if (tv.length) tv.after(item);
        else list.append(item);
    }

    setInterval(inject, 1000);

})();
