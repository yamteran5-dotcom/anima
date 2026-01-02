(function () {
    'use strict';

    function AnimeComponent() {
        var network = new Lampa.Request();
        var scroll;
        var html = $('<div class="category-full"></div>');

        this.create = function () {
            scroll = new Lampa.Scroll({mask: true, over: true});
            scroll.append(html);
            Lampa.Loading.start();
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc', function (json) {
                Lampa.Loading.stop();
                if (json && json.results) _this.build(json.results);
                else html.html('<div style="text-align:center; margin-top:50px;">Список пуст</div>');
            }, function () {
                Lampa.Loading.stop();
                html.html('<div style="text-align:center; margin-top:50px;">Ошибка сети</div>');
            });
        };

        this.build = function (results) {
            html.empty();
            results.forEach(function (item) {
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

        this.render = function () { return scroll ? scroll.render() : ''; };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // Регистрируем компонент сразу
    Lampa.Component.add('anime_final_fix', AnimeComponent);

    // Функция жесткой вставки
    function inject() {
        // Проверка: есть ли меню и нет ли уже нашей кнопки
        var menuList = $('.menu .menu__list');
        if (menuList.length && !$('.menu [data-action="anime_final_fix"]').length) {
            
            var menu_item = $(`
                <div class="menu__item selector" data-action="anime_final_fix">
                    <div class="menu__ico">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                        </svg>
                    </div>
                    <div class="menu__text">Аниме</div>
                </div>
            `);

            menu_item.on('click', function () {
                Lampa.Activity.push({
                    title: 'Аниме',
                    component: 'anime_final_fix'
                });
            });

            // Пытаемся вставить после "Сериалы" (tv) или просто вниз
            var tv = menuList.find('[data-action="tv"]');
            if (tv.length) tv.after(menu_item);
            else menuList.append(menu_item);
            
            console.log('Anime Plugin: Injected into DOM');
        }
    }

    // 1. Попытка через стандартный слушатель
    Lampa.Listener.follow('menu', function (e) {
        if (e.type == 'ready') inject();
    });

    // 2. Фоновый мониторинг (раз в 1.5 секунды)
    // Это решит проблему, если Lampac перерисовывает меню динамически
    setInterval(inject, 1500);

})();
