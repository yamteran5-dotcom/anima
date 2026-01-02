(function () {
    'use strict';

    // 1. Компонент каталога (TMDB Anime)
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
            // Используем проверенный путь Lampac
            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU', function (json) {
                Lampa.Loading.stop();
                if (json && json.results) _this.build(json.results);
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка сети');
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

    // 2. Регистрация компонента
    Lampa.Component.add('anime_mod_final', AnimeComponent);

    // 3. Прямая вставка в меню (Метод Online Mod)
    function injectMenu() {
        // Проверяем, не добавили ли мы уже кнопку
        if ($('.menu [data-action="anime_mod_final"]').length > 0) return;

        // Создаем элемент меню вручную
        var menu_item = $(`
            <div class="menu__item selector" data-action="anime_mod_final">
                <div class="menu__ico">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                        <polyline points="2 17 12 22 22 17"></polyline>
                        <polyline points="2 12 12 17 22 12"></polyline>
                    </svg>
                </div>
                <div class="menu__text">Аниме Онлайн</div>
            </div>
        `);

        // Вешаем событие клика
        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме Онлайн',
                component: 'anime_mod_final'
            });
        });

        // Вставляем в список меню после раздела "Сериалы" или просто в конец
        if ($('.menu [data-action="tv"]').length) {
            $('.menu [data-action="tv"]').after(menu_item);
        } else {
            $('.menu .menu__list').append(menu_item);
        }
    }

    // Запускаем проверку меню при старте и при каждом открытии меню
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') {
            injectMenu();
            // На всякий случай повторим через секунду, если Lampac перерисовал меню
            setTimeout(injectMenu, 1000);
            setTimeout(injectMenu, 3000);
        }
    });

})();
