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
            // Используем стандартный путь TMDB, который Лампа проксирует сама
            network.api('discover/tv?with_genres=16&with_original_language=ja&language=ru-RU&sort_by=popularity.desc', function (json) {
                Lampa.Loading.stop();
                if (json && json.results) _this.build(json.results);
                else _this.empty();
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

        this.empty = function() {
            html.html('<div style="text-align:center; margin-top:100px; color:#fff;">Ничего не найдено. Проверьте прокси в настройках TMDB.</div>');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // 1. Регистрация компонента
    Lampa.Component.add('anime_mod', AnimeComponent);

    // 2. Функция создания элемента меню
    function createBtn() {
        var btn = $(`
            <div class="menu__item selector" data-action="anime_mod">
                <div class="menu__ico">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                </div>
                <div class="menu__text">Аниме</div>
            </div>
        `);
        btn.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме', component: 'anime_mod' });
        });
        return btn;
    }

    // 3. Агрессивная вставка
    function pluginInit() {
        if ($('.menu [data-action="anime_mod"]').length) return;

        // Попытка №1: В стандартный список
        var list = $('.menu__list');
        if (list.length) {
            var tv = list.find('[data-action="tv"]');
            if (tv.length) tv.after(createBtn());
            else list.append(createBtn());
        }

        // Попытка №2: Через системный метод, если Lampac его не заблокировал
        if (Lampa.Menu && Lampa.Menu.add && !window.anime_menu_added) {
            Lampa.Menu.add({
                id: 'anime_mod',
                title: 'Аниме',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>',
                onSelect: function() { Lampa.Activity.push({ title: 'Аниме', component: 'anime_mod' }); }
            });
            window.anime_menu_added = true;
        }
    }

    // Запускаем мониторинг (раз в 2 сек), чтобы "возвращать" кнопку, если Lampac её удалил
    setInterval(pluginInit, 2000);

    // Также вешаем на событие открытия меню (на всякий случай)
    Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') pluginInit();
    });

})();
