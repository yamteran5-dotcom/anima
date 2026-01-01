(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div class="anime-best"></div>');
        var body    = $('<div class="category-full"></div>');
        var active_tab = 0;

        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: 'Новинки', params: 'order=popularity'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        // Внедряем стили для исправления верстки на ПК и ТВ
        if (!$('#anime-best-styles').length) {
            $('head').append('<style id="anime-best-styles">' +
                '.anime-best .layer--tabs { margin-bottom: 20px; position: relative; z-index: 10; }' +
                '.anime-best .category-full { display: flex; flex-wrap: wrap; gap: 10px; padding: 20px; }' +
                '.anime-best .card { margin: 5px; vertical-align: top; }' +
                '</style>');
        }

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
            scroll.reset();

            var api_url = 'https://shikimori.one/api/animes?limit=50&' + tabs[active_tab].params;
            
            // Пытаемся использовать системный прокси, если его нет — внешний corsproxy
            var final_url = (window.Lampa && Lampa.Utils && typeof Lampa.Utils.proxy === 'function') 
                ? Lampa.Utils.proxy(api_url) 
                : 'https://corsproxy.io/?' + encodeURIComponent(api_url);

            network.silent(final_url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    body.append('<div class="empty" style="padding:40px;text-align:center;">Список пуст. Проверьте настройки прокси.</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                body.append('<div class="empty" style="padding:40px;text-align:center;">Ошибка сети.</div>');
            });
        };

        this.build = function(json) {
            json.forEach(function (item) {
                var card_data = {
                    id: item.id,
                    title: item.russian || item.name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                };

                // Создаем карточку БЕЗ использования .on()
                var card = new Lampa.Card(card_data, { card_source: 'shikimori' });
                card.create();

                var card_html = card.render();
                
                // Вешаем событие клика напрямую на элемент через jQuery
                card_html.on('hover:enter', function() {
                    Lampa.Activity.push({
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card_data,
                        source: 'shikimori'
                    });
                });

                body.append(card_html);
            });
            Lampa.Controller.enable('content');
        };

        this.render  = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function start() {
        Lampa.Component.add('anime_best', AnimePlugin);
        var item = $('<div class="menu__item selector" data-action="anime_best">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg></div>' +
            '<div class="menu__text">Аниме</div>' +
        '</div>');

        item.on('hover:enter', function () {
            Lampa.Activity.push({title: 'Аниме', component: 'anime_best'});
        });

        $('.menu .menu__list').append(item);
    }

    if (window.appready) start();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') start(); });
})();
