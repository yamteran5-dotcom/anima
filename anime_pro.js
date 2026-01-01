(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var html    = $('<div class="anime-pro-v14"></div>');
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
                '.anime-pro-v14 .layer--tabs { margin-bottom: 10px; height: 3.5em; }' +
                '.anime-pro-v14 .category-full { display: flex; flex-wrap: wrap; padding: 10px; }' +
                '.anime-pro-v14 .card { margin: 10px; width: 140px; cursor: pointer; }' +
                '.anime-pro-v14 .card img { border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }' +
                '.anime-info-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 1000; padding: 40px; display: flex; }' +
                '.anime-info-left { width: 300px; margin-right: 40px; }' +
                '.anime-info-left img { width: 100%; border-radius: 10px; }' +
                '.anime-info-right { flex: 1; }' +
                '.anime-info-right h1 { font-size: 2.5em; margin-bottom: 20px; }' +
                '.anime-info-close { position: absolute; top: 20px; right: 40px; font-size: 2em; cursor: pointer; }' +
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
                }
            }, function () {
                Lampa.Loading.stop();
                body.append('<div class="empty">Ошибка сети</div>');
            });
        };

        this.showDetails = function(item) {
            var overlay = $('<div class="anime-info-overlay">' +
                '<div class="anime-info-close">×</div>' +
                '<div class="anime-info-left"><img src="https://shikimori.one' + item.image.original + '"></div>' +
                '<div class="anime-info-right">' +
                    '<h1>' + (item.russian || item.name) + '</h1>' +
                    '<p style="font-size: 1.2em; color: #aaa;">Год: ' + (item.aired_on || 'Неизвестно') + ' | Оценка: ' + item.score + '</p>' +
                    '<div style="margin-top: 30px; background: #e74c3c; padding: 15px 30px; display: inline-block; border-radius: 5px; font-weight: bold; cursor: pointer;" class="start-play">СМОТРЕТЬ</div>' +
                '</div>' +
            '</div>');

            overlay.find('.anime-info-close').on('click', function() { overlay.remove(); });
            
            overlay.find('.start-play').on('click', function() {
                // Вызов встроенного поиска видео Lampa по названию
                Lampa.Api.search({ query: item.russian || item.name }, function(data) {
                    // Если поиск сработает, откроется плеер или список торрентов
                });
                overlay.remove();
            });

            $('body').append(overlay);
        };

        this.build = function(json) {
            var _this = this;
            json.forEach(function (item) {
                var card_data = {
                    title: item.russian || item.name,
                    img: 'https://shikimori.one' + item.image.original,
                    year: item.aired_on ? item.aired_on.split('-')[0] : ''
                };

                var card = new Lampa.Card(card_data);
                card.create();
                var card_element = card.render();
                card_element.addClass('selector');

                card_element.on('click', function() {
                    _this.showDetails(item);
                });

                body.append(card_element);
            });
            Lampa.Controller.enable('content');
        };

        this.render = function () { return html; };
        this.destroy = function () { network.clear(); scroll.destroy(); html.remove(); };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v14', AnimePlugin);
        var menu_item = $('<div class="menu__item selector" data-action="anime_v14">' +
            '<div class="menu__ico"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg></div>' +
            '<div class="menu__text">Аниме v14</div>' +
        '</div>');

        menu_item.on('click', function () {
            Lampa.Activity.push({ title: 'Аниме v14', component: 'anime_v14' });
        });
        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type == 'ready') startPlugin(); });
})();
