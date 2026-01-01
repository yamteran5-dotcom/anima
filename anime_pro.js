(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div></div>');
        var body    = $('<div class="category-full"></div>');
        var active_tab = 0;

        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: 'Новинки', params: 'season=2025_2026&order=popularity'},
            {title: 'Все', params: 'order=popularity'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        this.create = function () {
            var _this = this;
            var bar  = $('<div class="layer--tabs"><div class="layer--tabs_list"></div></div>');
            
            tabs.forEach(function (tab, i) {
                var t = $('<div class="layer--tabs_item selector">' + tab.title + '</div>');
                if (i === active_tab) t.addClass('active');
                t.on('hover:enter', function () {
                    if (active_tab === i) return;
                    active_tab = i;
                    bar.find('.layer--tabs_item').removeClass('active');
                    $(this).addClass('active');
                    _this.load();
                });
                bar.find('.layer--tabs_list').append(t);
            });

            html.append(bar).append(scroll.render());
            scroll.append(body);
            this.load();
            return this.render();
        };

        this.load = function () {
            var _this = this;
            Lampa.Loading.start();
            body.empty();

            // Пробуем использовать проксирование через разные зеркала, если первое не сработает
            var url = 'https://shikimori.one/api/animes?limit=40&' + tabs[active_tab].params;
            
            network.silent(Lampa.Utils.proxy(url), function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    body.append('<div class="empty">Данные от сервера пусты</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                body.append('<div class="empty">Ошибка сети. Попробуйте включить "Прокси" в настройках Lampa.</div>');
            });
        };

        this.build = function(json) {
            var _this = this;
            json.forEach(function (item) {
                var card = new Lampa.Card({
                    id: item.id,
                    title: item.russian || item.name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                }, { card_source: 'shikimori' });

                card.on('enter', function () {
                    Lampa.Activity.push({
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card.object,
                        source: 'shikimori'
                    });
                });

                card.create();
                body.append(card.render());
            });
            Lampa.Controller.enable('content');
        };

        this.render  = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function start() {
        Lampa.Component.add('anime_pro', AnimePlugin);
        var item = $('<div class="menu__item selector" data-action="anime_pro">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Pro</div>' +
        '</div>');
        item.on('hover:enter', function () {
            Lampa.Activity.push({title: 'Аниме Pro', component: 'anime_pro'});
        });
        $('.menu .menu__list').append(item);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();
