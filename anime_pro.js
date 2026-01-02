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

            // Метод Lampac: используем Lampa.TMDB.api для формирования ссылки через прокси
            // Добавляем API-ключ напрямую, так как в плагинах он иногда теряется
            var key = '4ef0d35509cc14c9ef8952448ca32757';
            var url = 'discover/tv?api_key=' + key + '&with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc';

            network.api(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.results && json.results.length) {
                    _this.build(json.results);
                } else {
                    html.html('<div style="text-align:center; margin-top:50px; color:#fff;">Ничего не найдено (TMDB вернул 0 результатов)</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                html.html('<div style="text-align:center; margin-top:50px; color:#fff;">Ошибка сети или блокировка прокси</div>');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
                if (!item.poster_path) return;

                var card = new Lampa.Card({
                    title: item.name || item.original_name,
                    // Используем системную функцию для картинок, чтобы обойти блокировку CORS
                    img: Lampa.TMDB.image(item.poster_path), 
                    year: item.first_air_date ? item.first_air_date.split('-')[0] : ''
                });

                card.create();
                card.on('click', function () {
                    // Открываем полную карточку Lampac (не поиск)
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

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); html.remove(); };
    }

    Lampa.Component.add('anime_final_fixed', AnimeComponent);

    function injectMenu() {
        if ($('.menu [data-action="anime_final_fixed"]').length) return;
        var list = $('.menu .menu__list');
        if (!list.length) return;

        var menuItem = $(`
            <div class="menu__item selector" data-action="anime_final_fixed">
                <div class="menu__ico">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                    </svg>
                </div>
                <div class="menu__text">Аниме</div>
            </div>
        `);

        menuItem.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме', component: 'anime_final_fixed' });
        });

        var tv = list.find('[data-action="tv"]');
        if (tv.length) tv.after(menuItem); else list.append(menuItem);
    }

    // Следим за меню постоянно (fix для lampa.mx)
    setInterval(injectMenu, 1000);
})();
