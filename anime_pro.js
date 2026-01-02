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

            // Параметры для поиска аниме (жанр 16, японский язык)
            var path = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            // Используем системный метод TMDB. Он сам подставит прокси и API-ключ из настроек Лампы
            Lampa.TMDB.get(path, {}, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty('TMDB не вернул результаты. Попробуйте изменить "Источник" в настройках TMDB.');
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети. Проверьте настройки прокси в разделе TMDB.');
            });
        };

        this.build = function (results) {
            var _this = this;
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: Lampa.TMDB.image(item.poster_path), // Системный метод для картинок
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

        this.empty = function(msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff; padding:20px;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    Lampa.Component.add('anime_fix', AnimeComponent);

    function inject() {
        if ($('.menu [data-action="anime_fix"]').length) return;
        var list = $('.menu .menu__list, .menu__list');
        if (list.length) {
            var item = $(`
                <div class="menu__item selector" data-action="anime_fix">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);
            item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме Онлайн', component: 'anime_fix' });
            });
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(item); else list.append(item);
        }
    }
    setInterval(inject, 1000);
})();
