'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var EB_WIDGETS_SRC = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';

var EBEventListFactory = function () {
    _createClass(EBEventListFactory, [{
        key: '_loadScript',
        value: function _loadScript(url, callback) {
            $.ajax({
                url: url,
                dataType: 'script',
                success: callback,
                async: true
            });
        }
    }]);

    function EBEventListFactory(_ref) {
        var divTargetId = _ref.divTargetId,
            organizerId = _ref.organizerId,
            _ref$eventImageWidth = _ref.eventImageWidth,
            eventImageWidth = _ref$eventImageWidth === undefined ? 300 : _ref$eventImageWidth,
            _ref$pageNumber = _ref.pageNumber,
            pageNumber = _ref$pageNumber === undefined ? 1 : _ref$pageNumber,
            _ref$pageSize = _ref.pageSize,
            pageSize = _ref$pageSize === undefined ? 10 : _ref$pageSize,
            _ref$buttonText = _ref.buttonText,
            buttonText = _ref$buttonText === undefined ? "Get Tickets" : _ref$buttonText,
            apiToken = _ref.apiToken,
            _ref$onOrderComplete = _ref.onOrderComplete,
            onOrderComplete = _ref$onOrderComplete === undefined ? function () {} : _ref$onOrderComplete;

        _classCallCheck(this, EBEventListFactory);

        this.organizerId = organizerId;
        this.eventImageHeight = eventImageWidth / 2;
        this.eventImageWidth = eventImageWidth;
        this.divTargetId = divTargetId;
        this.pageSize = pageSize;
        this.pageNumber = pageNumber;
        this.apiToken = apiToken;
        this.buttonText = buttonText;
        this.onOrderComplete = onOrderComplete;
    }

    _createClass(EBEventListFactory, [{
        key: '_getPageNumbers',
        value: function _getPageNumbers(data) {
            var numberElems = [];
            var _data$pagination = data.pagination,
                pageSize = _data$pagination.page_size,
                pageNumber = _data$pagination.page_number,
                pageCount = _data$pagination.page_count;


            for (var i = 0; i < pageCount; i++) {
                if (i + 1 === pageNumber) {
                    numberElems.push($('<span class="page-number--active">' + (i + 1) + '</span>'));
                } else {
                    numberElems.push($('<a class="page-number" href="javascript:void(0)">' + (i + 1) + '</a>').click(this.setPageNumber.bind(this, i + 1)));
                }
            }
            var pageNumbers = $('<div class="page-numbers"></div>');
            pageNumbers.append(numberElems);

            return pageNumbers;
        }
    }, {
        key: '_formatDateString',
        value: function _formatDateString(dateStr) {
            var date = new Date(dateStr);

            return date.toLocaleDateString();
        }
    }, {
        key: '_getEventMarkup',
        value: function _getEventMarkup(event) {
            var eventDescription = event.summary ? '<div class="event description">\n            ' + event.summary + '\n        </div' : '';
            return $('<div class="event-detail" id="' + event.id + '">\n                <a class="background--inner has-image"\n                    href="' + event.url + '"\n                    title="' + event.name + '"\n                    tabindex="-1"\n                    style="background-image: url(' + (event.image ? event.image.url : '') + ');\n                    height: ' + this.eventImageHeight + 'px;\n                    width: ' + this.eventImageWidth + 'px;\n                    display: block;"\n                />\n                <div class="details">\n                    <div class="block">\n                        <h1 class="title title--text">\n                            <a title="' + event.name + '" href="' + event.url + '">' + event.name + '</a>\n                        </h1>\n                        <div class="date icon-date">\n                            <span class="date__day">\n                                ' + this._formatDateString(event.start_date) + '\n                            </span>\n                            <span class="date__time">\n                                ' + event.start_time + ' - ' + event.end_time + '\n                            </span>\n                        </div>\n                        ' + eventDescription + '\n                    </div>\n                    <div class="register-button">\n                        <button id="register-button-' + event.id + '" class="event-button">\n                            ' + this.buttonText + '\n                        </button>\n                    </div>\n                </div>\n            </div>');
        }
    }, {
        key: 'setPageNumber',
        value: function setPageNumber(pageNumber) {
            this.pageNumber = pageNumber;
            this.renderEvents();
        }
    }, {
        key: '_doRender',
        value: function _doRender(data) {
            // Reset markup in target div
            $('#' + this.divTargetId).html('');

            for (var i = 0; i < data.events.length; i++) {
                var event = data.events[i];
                var markup = this._getEventMarkup.apply(this, [event]);
                $('#' + this.divTargetId).append(markup);
                window.EBWidgets.createWidget({
                    widgetType: 'checkout',
                    eventId: event.id,
                    modal: true,
                    modalTriggerElementId: 'register-button-' + event.id,
                    onOrderComplete: this.onOrderComplete
                });
            }

            var pageNumbers = this._getPageNumbers(data);

            $('#' + this.divTargetId).append(pageNumbers);
        }
    }, {
        key: 'renderEvents',
        value: function renderEvents() {
            var _this = this;

            var requestUrl = 'https://www.eventbriteapi.com/v3/destination/organizers/' + this.organizerId + '/events/?token=' + this.apiToken + '&expand=image&time_filter=current_future&page_size=' + this.pageSize + '&page_number=' + this.pageNumber;

            $.get(requestUrl, function (data) {

                if (!_this.scriptLoaded) {
                    _this._loadScript(EB_WIDGETS_SRC, function () {
                        _this._doRender.apply(_this, [data]);
                        _this.scriptLoaded = true;
                    });
                } else {
                    _this._doRender.apply(_this, [data]);
                }
            });
        }
    }]);

    return EBEventListFactory;
}();
//# sourceMappingURL=all.js.map
