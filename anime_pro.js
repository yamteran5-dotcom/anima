(function () {
    'use strict';

    function AnimePlugin(object) {
        // Ошибка №1: Используем только стандартные методы
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        var html    = $('<div></div>');
        
        this.create = function () {
            var _this = this;
            html.append(scroll.render());
            scroll.append(body);
            this.load();
            return html;
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            
            // Прямой запрос к Shikimori. 
            // Если bwa.to/rc работает, он должен пропускать эти запросы.
            var url = 'https://shikimori.one/api/animes?limit=50&order=popularity&kind=tv';

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    Lampa.Noty.show('Список пуст. Проверьте сеть.');
                }
            }, function (a, c) {
                Lampa.Loading.stop();
                Lampa.Noty.show('Shikimori заблокировал запрос');
            });
        };

        this.build = function (json) {
            var _this = this;
            json.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.russian || item.name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                });

                card.create();
                
                // Исправление логики клика: вызываем системный поиск
                card.on('click', function () {
                    Lampa.Search.open({
                        query: item.russian || item.name
                    });
                });

                body.append(card.render());
            });
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    // Регистрация плагина через нативный метод Lampa
    function start() {
        Lampa.Component.add('anime_pro', AnimePlugin);

        var menu_item = $('<div class="menu__item selector" data-action="anime_pro">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M10 8l6 4-6 4V8z"></path></svg></div>' +
            '<div class="menu__text">Аниме Про</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме Про',
                component: 'anime_pro',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();
