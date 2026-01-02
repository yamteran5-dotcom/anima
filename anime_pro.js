(function () {
    'use strict';

    function AnimePlugin() {
        var network = new Lampa.Request(); // ✔ исправлено
        var scroll;
        var html = $('<div class="anime-v19" style="width:100%; height:100%; background:#141414;"></div>');
        var container = $('<div class="anime-grid" style="display:flex; flex-wrap:wrap; padding:20px; gap:10px; justify-content:center;"></div>');

        var tabs = [
            {title: 'Топ', params: 'order=ranked'},
            {title: 'Онгоинги', params: 'status=ongoing'},
            {title: '18+', params: 'rating=rx,r_plus'}
        ];

        this.create = function () {
            var _this = this;

            var header = $('<div style="height:60px; display:flex; align-items:center; padding:0 30px; border-bottom:1px solid #333; background:#1a1a1a;"></div>');

            tabs.forEach(function(tab, i) {
                var btn = $('<div class="selector" style="margin-right:25px; cursor:pointer; font-weight:bold; font-size:16px; opacity:0.6;">' + tab.title + '</div>');
                if (i === 0) btn.css({opacity: 1, color: '#ff3e3e'});

                btn.on('click', function() {
                    header.find('.selector').css({opacity: 0.6, color: '#fff'});
                    $(this).css({opacity: 1, color: '#ff3e3e'});
                    _this.load(tab.params);
                });

                header.append(btn);
            });

            scroll = new Lampa.Scroll({mask: true, over: true});
            html.append(header);
            html.append(scroll.render());
            scroll.append(container);

            this.load(tabs[0].params);
            return html;
        };

        this.load = function (params) {
            Lampa.Loading.start();
            container.empty();

            // ❗ corsproxy УБРАН, запрос напрямую
            var url = 'https://shikimori.one/api/animes?limit=40&' + params;

            network.silent(url, function (json) {
                Lampa.Loading.stop();

                // ❗ защита от HTML / ошибок
                if (!Array.isArray(json)) {
                    Lampa.Noty.show('Источник недоступен');
                    return;
                }

                json.forEach(function (item) {
                    if (!item.image || !item.image.original) return;

                    var name = item.russian || item.name || 'Без названия';

                    var card = $(
                        '<div class="selector" style="width:150px; cursor:pointer;">' +
                            '<img src="https://shikimori.one' + item.image.original + '" style="width:100%; height:215px; object-fit:cover; border-radius:8px;">' +
                            '<div style="font-size:13px; margin-top:6px; text-align:center; height:34px; overflow:hidden;">' + name + '</div>' +
                        '</div>'
                    );

                    // ✔ корректный переход в поиск
                    card.on('click', function () {
                        Lampa.Controller.toggle('content');
                        setTimeout(function () {
                            Lampa.Search.open({query: name});
                        }, 50);
                    });

                    container.append(card);
                });

                Lampa.Controller.enable('content');
            }, function () {
                Lampa.Loading.stop();
                Lampa.Noty.show('Ошибка сети');
            });
        };

        this.render = function () {
            return html;
        };

        this.destroy = function () {
            network.clear();
            if (scroll) scroll.destroy();
            html.remove();
        };
    }

    function startPlugin() {
        Lampa.Component.add('anime_v19', AnimePlugin);

        // ✔ корректная регистрация пункта меню
        Lampa.Menu.add({
            id: 'anime_v19',
            title: 'Аниме Фикс',
            onSelect: function () {
                Lampa.Activity.push({
                    title: 'Аниме Фикс',
                    component: 'anime_v19'
                });
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });

})();
