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

            // Используем относительный путь. 
            // Lampa автоматически подставит прокси и ключ из своих настроек.
            var url = 'discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    _this.empty('Данные не получены. Проверьте Настройки - TMDB.');
                }
            }, function () {
                Lampa.Loading.stop();
                _this.empty('Ошибка сети. Возможно, не включен прокси в настройках Lampa.');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    img: 'https://image.tmdb.org/t/p/w500' + item.poster_path,
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function () {
                    Lampa.Search.open({ query: item.name || item.original_name });
                });

                html.append(card.render());
            });

            Lampa.Controller.enable('content');
        };

        this.empty = function(msg) {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff;">' + msg + '</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); html.remove(); };
    }

    Lampa.Component.add('anime_v43', AnimeComponent);

    function inject() {
        if ($('.menu [data-action="anime_v43"]').length) return;
        var menuList = $('.menu .menu__list, .menu__list');
        if (menuList.length) {
            var menu_item = $(`
                <div class="menu__item selector" data-action="anime_v43">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            menu_item.on('click', function () {
                Lampa.Activity.push({ title: 'Аниме Онлайн', component: 'anime_v43' });
            });

            var tv = menuList.find('[data-action="tv"]');
            if (tv.length) tv.after(menu_item);
            else menuList.append(menu_item);
        }
    }

    setInterval(inject, 1500);
})();
