(function () {
    'use strict';

    function AnimeComponent(object) {
        var _this = this;
        var scroll;
        var html = $('<div class="category-full"></div>');
        var active_tab = 'popular';

        // Эндпоинты
        var routes = {
            ongoing: 'discover/tv?with_genres=16&with_original_language=ja&air_date.gte=' + new Date().toISOString().split('T')[0],
            watching: 'tv/trending/day?with_genres=16',
            popular: 'discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc',
            top100: 'discover/tv?with_genres=16&sort_by=vote_average.desc&vote_count.gte=500',
            adult: 'discover/tv?with_genres=16&include_adult=true'
        };

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            
            // Вкладки
            var tabs_html = $('<div class="category-tabs"></div>');
            var tabs = [
                {title: 'Онгоинги', id: 'ongoing'},
                {title: 'Сейчас смотрят', id: 'watching'},
                {title: 'Популярное', id: 'popular'},
                {title: 'Топ 100', id: 'top100'},
                {title: '18+', id: 'adult'}
            ];

            tabs.forEach(function (tab) {
                var btn = $('<div class="category-tabs__item selector">' + tab.title + '</div>');
                if (tab.id === active_tab) btn.addClass('active');
                
                btn.on('click', function () {
                    if ($(this).hasClass('active')) return;
                    tabs_html.find('.active').removeClass('active');
                    $(this).addClass('active');
                    active_tab = tab.id;
                    _this.load();
                });
                tabs_html.append(btn);
            });

            scroll.append(tabs_html);
            scroll.append(html);
            
            this.load();
            return scroll.render();
        };

        this.load = function () {
            Lampa.Loading.start();
            html.empty();

            // Запрос через системный Api (Lampac Proxy)
            Lampa.Api.get(routes[active_tab], {}, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty('В этой категории пусто');
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети. Проверьте настройки TMDB.');
            });
        };

        this.build = function (results) {
            results.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.Api.img(item.poster_path),
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function () {
                    Lampa.Activity.push({
                        title: item.name || item.original_name,
                        component: 'full',
                        id: item.id,
                        method: 'tv',
                        card: item
                    });
                });
                html.append(card.render());
            });
            // Активируем контроллер для навигации пультом
            Lampa.Controller.enable('content');
        };

        this.empty = function (msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff; font-size:1.5em;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { scroll.destroy(); html.remove(); };
    }

    // Регистрация компонента
    Lampa.Component.add('anime_catalog_pro', AnimeComponent);

    // Вставка в меню
    function inject() {
        if ($('.menu [data-action="anime_pro"]').length) return;
        var list = $('.menu .menu__list');
        if (list.length) {
            var item = $(
                '<div class="menu__item selector" data-action="anime_pro">' +
                    '<div class="menu__ico">🎌</div>' +
                    '<div class="menu__text">Аниме</div>' +
                '</div>'
            );

            item.on('click', function () {
                Lampa.Activity.push({
                    title: 'Аниме',
                    component: 'anime_catalog_pro'
                });
            });

            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item); else list.append(item);
        }
    }

    setInterval(inject, 1000);
})();
