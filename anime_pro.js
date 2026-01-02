(function () {
    'use strict';

    function AnimeMod(object) {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var html    = $('<div class="category-full"></div>');
        
        this.create = function () {
            var _this = this;
            this.load();
            return scroll.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            
            // Используем ту же структуру запроса, что и в online_mod
            var url = 'https://shikimori.one/api/animes?limit=50&order=popularity&kind=tv';

            network.silent(url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    Lampa.Noty.show("Ошибка: Список пуст");
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show("Нет ответа от сервера");
            });
        };

        this.build = function (json) {
            var _this = this;
            scroll.append(html);

            json.forEach(function (item) {
                var card = new Lampa.Card({
                    title: item.russian || item.name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                });

                card.create();

                // Использование поиска bwa.to/rc при клике
                card.on('click', function () {
                    Lampa.Search.open({
                        query: item.russian || item.name
                    });
                });

                html.append(card.render());
            });

            Lampa.Controller.enable('content');
        };

        this.render = function () { return scroll.render(); };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    // Регистрация в меню (в стиле оригинального online_mod)
    function startPlugin() {
        Lampa.Component.add('anime_mod', AnimeMod);

        var menu_item = $('<div class="menu__item selector" data-action="anime_mod">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Online</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме Online',
                component: 'anime_mod',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
