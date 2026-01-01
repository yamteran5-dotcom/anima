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
            {title: 'Новинки', params: 'order=popularity'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        this.create = function () {
            var _this = this;
            var bar  = $('<div class="layer--tabs"><div class="layer--tabs_list"></div></div>');
            
            tabs.forEach(function (tab, i) {
                var t = $('<div class="layer--tabs_item selector">' + tab.title + '</div>');
                if (i === active_tab) t.addClass('active');
                t.on('hover:enter', function () {
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

            // Прямая ссылка на API Shikimori
            var api_url = 'https://shikimori.one/api/animes?limit=50&' + tabs[active_tab].params;
            
            // Используем системный метод Lampa для обхода CORS
            network.silent(Lampa.Utils.proxy(api_url), function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    body.append('<div class="empty" style="padding:40px;text-align:center;">Данные не получены. Попробуйте сменить прокси в настройках Lampa.</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                body.append('<div class="empty" style="padding:40px;text-align:center;">Ошибка подключения к API</div>');
            });
        };

        this.build = function(json) {
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
        Lampa.Component.add('anime_fix', AnimePlugin);
        var item = $('<div class="menu__item selector" data-action="anime_fix">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v12M6 12h12"></path></svg></div>' +
            '<div class="menu__text">Аниме Fix</div>' +
        '</div>');
        item.on('hover:enter', function () {
            Lampa.Activity.push({title: 'Аниме Fix', component: 'anime_fix'});
        });
        $('.menu .menu__list').append(item);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();
