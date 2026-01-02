(function () {
    'use strict';

    // 1. Создаем компонент
    function AnimePlugin() {
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
            // Используем прямой путь — в Lampac это самый надежный метод
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

        this.render = function () { return scroll ? scroll.render() : $('<div></div>'); };
        this.destroy = function () { network.clear(); if(scroll) scroll.destroy(); };
    }

    // 2. Регистрация (Метод, который точно не вешает Lampac)
    function start() {
        if (window.anime_installed) return;
        window.anime_installed = true;

        Lampa.Component.add('anime_comp', AnimePlugin);

        // В Lampac лучше добавлять через проверку наличия меню
        var add = function() {
            var menu_item = {
                id: 'anime_comp',
                title: 'Аниме Онлайн',
                icon: '<svg height="36" viewBox="0 0 24 24" width="36" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
                onSelect: function () {
                    Lampa.Activity.push({ title: 'Аниме', component: 'anime_comp' });
                }
            };
            
            if (Lampa.Menu && Lampa.Menu.add) {
                Lampa.Menu.add(menu_item);
            }
        };

        // Запуск
        if (window.appready) add();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') add(); });
    }

    // Выполняем сразу, без ожидания
    start();

})();
