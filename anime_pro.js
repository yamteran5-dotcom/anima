(function () {
    'use strict';

    function AnimeComponent() {
        var scroll;
        var html = $('<div class="category-full"></div>');
        var _this = this;

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            scroll.append(html);
            this.load();
            return scroll.render();
        };

        this.load = function () {
            Lampa.Loading.start();
            
            // Формируем запрос через Api.get, который Lampac проксирует сам на уровне сервера
            // Жанр 16 (Аниме), японский язык, сортировка по популярности
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            Lampa.Api.get(url, {}, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty('Данные не получены. Проверьте источник в настройках TMDB.');
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети. Lampac не смог проксировать запрос.');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.Api.img(item.poster_path), // Важно: проксирование картинок через Api
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

        this.empty = function (msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { if(scroll) scroll.destroy(); html.remove(); };
    }

    Lampa.Component.add('anime_native', AnimeComponent);

    function inject() {
        if ($('.menu [data-action="anime_native"]').length) return;
        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $('<div class="menu__item selector" data-action="anime_native"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div><div class="menu__text">Аниме</div></div>');
            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме', component: 'anime_native' });
            });
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item); else list.append(item);
        }
    }

    setInterval(inject, 500);
})();
