(function () {
    'use strict';

    function AnimePlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div class="anime-pro-v11"></div>');
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
                '.anime-pro-v11 .layer--tabs { margin-bottom: 10px; height: 3.5em; }' +
                '.anime-pro-v11 .category-full { display: flex; flex-wrap: wrap; padding: 10px; }' +
                '.anime-pro-v11 .card { margin: 10px; width: 140px; cursor: pointer; }' +
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
                    body.append('<div class="empty">Ничего не найдено</div>');
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
                    year: item.aired_on ? item.aired_on.split('-')[0] : '',
                    type: 'anime'
                };

                var card = new Lampa.Card(card_data, { card_source: 'shikimori' });
                card.create();
                
                var card_element = card.render();

                card_element.on('click', function() {
                    // Используем универсальный метод открытия через поиск карточки
                    var search_data = {
                        method: 'anime',
                        url: '',
                        title: card_data.title,
                        id: item.id,
                        card: card_data
                    };
                    
                    Lampa.Component.add('full', search_data);
                    Lampa.Activity.push(search_data);
                });

                body.append(card_element);
            });
            Lampa.Controller.enable('content');
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v11', AnimePlugin);
        
        var menu_item = $('<div class="menu__item selector" data-action="anime_v11">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме Pro</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({
                title: 'Аниме Pro',
                component: 'anime_v11',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
