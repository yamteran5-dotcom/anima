(function () {
    'use strict';

    function AnimePlugin(object) {
        var network = new Lampa.Request();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var body    = $('<div class="category-full"></div>');
        var html    = $('<div></div>');
        
        this.create = function () {
            html.append(scroll.render());
            scroll.append(body);
            this.load();
            return html;
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            
            // Используем bwa прокси, если он доступен, или универсальный ретранслятор
            var base_url = 'https://shikimori.one/api/animes?limit=50&order=popularity&kind=tv';
            var proxy_url = 'https://corsproxy.io/?' + encodeURIComponent(base_url);

            network.silent(proxy_url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    body.append('<div class="empty">Список пуст. Попробуйте включить Прокси в настройках Lampa.</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка доступа. BWA не пропустил запрос.');
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
                
                // Главное: Передача управления в BWA-парсер
                card.on('click', function () {
                    // Мы не открываем пустую карточку, а сразу триггерим поиск видео
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

    function start() {
        Lampa.Component.add('anime_bwa', AnimePlugin);

        var addMenuItem = function() {
            var menu_item = $('<div class="menu__item selector" data-action="anime_bwa">' +
                '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg></div>' +
                '<div class="menu__text">Аниме (BWA)</div>' +
            '</div>');

            menu_item.on('click', function () {
                Lampa.Activity.push({
                    title: 'Аниме',
                    component: 'anime_bwa',
                    page: 1
                });
            });
            $('.menu .menu__list').append(menu_item);
        };

        if (window.appready) addMenuItem();
        else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') addMenuItem(); });
    }

    start();
})();
