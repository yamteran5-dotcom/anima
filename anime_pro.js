(function () {
    'use strict';

    function AnimePlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div class="anime-pro-container"></div>');
        var body    = $('<div class="category-full"></div>');
        var active_tab = 0;

        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: 'Новинки', params: 'order=popularity'},
            {title: '18+', params: 'rating=rx,r_plus&censored=false'}
        ];

        if (!$('#anime-pro-style').length) {
            $('head').append('<style id="anime-pro-style">' +
                '.anime-pro-container .layer--tabs { margin-bottom: 10px; position: relative; z-index: 10; height: 3.5em; }' +
                '.anime-pro-container .category-full { display: flex; flex-wrap: wrap; padding: 10px; align-items: flex-start; }' +
                '.anime-pro-container .card { margin: 10px; width: 140px; cursor: pointer; }' +
                '.anime-pro-container .layer--tabs_item.active { border-bottom: 2px solid #fff; }' +
                '</style>');
        }

        this.create = function () {
            var _this = this;
            var bar  = $('<div class="layer--tabs"><div class="layer--tabs_list"></div></div>');
            
            tabs.forEach(function (tab, i) {
                var t = $('<div class="layer--tabs_item selector">' + tab.title + '</div>');
                if (i === active_tab) t.addClass('active');
                t.on('click', function () {
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
            var final_url = 'https://corsproxy.io/?' + encodeURIComponent(api_url);

            network.silent(final_url, function (json) {
                Lampa.Loading.stop();
                if (json && json.length) {
                    _this.build(json);
                } else {
                    body.append('<div class="empty" style="text-align:center;width:100%;padding:40px;">Ничего не найдено</div>');
                }
            }, function () {
                Lampa.Loading.stop();
                body.append('<div class="empty">Ошибка сети</div>');
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

                var card = new Lampa.Card(card_data, { card_source: 'shikimori' });
                card.create();
                
                var card_element = card.render();

                card_element.on('click', function() {
                    // Исправленный вызов полной карточки
                    Lampa.Activity.push({
                        url: '',
                        title: card_data.title,
                        component: 'full',
                        id: item.id,
                        method: 'anime',
                        card: card_data,
                        source: 'shikimori'
                    });
                });

                body.append(card_element);
            });
            Lampa.Controller.enable('content');
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_pro_v9', AnimePlugin);
        
        var menu_item = $('<div class="menu__item selector" data-action="anime_pro_v9">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Pro</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме Pro',
                component: 'anime_pro_v9',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
