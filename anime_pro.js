(function () {
    'use strict';

    function AnimeComponent() {
        var network = new Lampa.Request();
        var scroll;
        var html = $('<div class="category-full"></div>');

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();

            // Чистый метод Lampac: запрос через прокси-контроллер ядра
            // 16 - аниме, ja - японский, discover/tv - сериалы
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            Lampa.Api.proxy(url, function (json) {
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
            var _this = this;
            html.empty();
            results.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.Api.img(item.poster_path), // Проксирование картинок по методу Lampac
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });
                card.create();
                card.on('click', function () {
                    Lampa.Activity.push({
                        url: '',
                        title: item.name || item.original_name,
                        component: 'full',
                        id: item.id,
                        method: 'tv',
                        card: item
                    });
                });
                html.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.empty = function () {
            html.html('<div class="empty">Ничего не найдено (Проверьте прокси TMDB в настройках)</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // Регистрация компонента
    Lampa.Component.add('anime_clean', AnimeComponent);

    // Вставка в меню методом "Постоянного присутствия" (как в плагинах Lampac)
    function inject() {
        if ($('.menu [data-action="anime_clean"]').length) return;
        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $('<div class="menu__item selector" data-action="anime_clean"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div><div class="menu__text">Аниме</div></div>');
            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме', component: 'anime_clean' });
            });
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item); else list.append(item);
        }
    }

    // Запуск цикла вставки
    setInterval(inject, 1000);

})();
