const EB_WIDGETS_SRC = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';

class EBEventListFactory {

    _loadScript(url, callback) {
        $.ajax({
            url: url,
            dataType: 'script',
            success: callback,
            async: true
        });
    }

    constructor({
        divTargetId,
        organizerId,
        eventImageWidth = 300,
        pageNumber = 1,
        pageSize = 10,
        buttonText = "Get Tickets",
        apiToken,
        onOrderComplete = () => {},
    }) {
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

    _getPageNumbers(data) {
        const numberElems = [];
        const { page_size: pageSize, page_number: pageNumber, page_count: pageCount } = data.pagination;

        for (let i = 0; i < pageCount; i++) {
            if (i + 1 === pageNumber) {
                numberElems.push($(`<span class="page-number--active">${i + 1}</span>`));
            } else {
                numberElems.push($(`<a class="page-number" href="javascript:void(0)">${i + 1}</a>`).click(this.setPageNumber.bind(this, i + 1)));
            }
        }
        let pageNumbers = $(`<div class="page-numbers"></div>`);
        pageNumbers.append(numberElems);

        return pageNumbers;
    }

    _formatDateString(dateStr) {
        let date = new Date(dateStr);

        return date.toLocaleDateString();
    }

    _getEventMarkup(event) {
        const eventDescription = event.summary ?
        `<div class="event description">
            ${event.summary}
        </div` : '';
        return $(
            `<div class="event-detail" id="${event.id}">
                <a class="background--inner has-image"
                    href="${event.url}"
                    title="${event.name}"
                    tabindex="-1"
                    style="background-image: url(${event.image ? event.image.url : ''});
                    height: ${this.eventImageHeight}px;
                    width: ${this.eventImageWidth}px;
                    display: block;"
                />
                <div class="details">
                    <div class="block">
                        <h1 class="title title--text">
                            <a title="${event.name}" href="${event.url}">${event.name}</a>
                        </h1>
                        <div class="date icon-date">
                            <span class="date__day">
                                ${this._formatDateString(event.start_date)}
                            </span>
                            <span class="date__time">
                                ${event.start_time} - ${event.end_time}
                            </span>
                        </div>
                        ${eventDescription}
                    </div>
                    <div class="register-button">
                        <button id="register-button-${event.id}" class="event-button">
                            ${this.buttonText}
                        </button>
                    </div>
                </div>
            </div>`
        );
    }

    setPageNumber(pageNumber) {
        this.pageNumber = pageNumber;
        this.renderEvents();
    }

    _doRender(data) {
        // Reset markup in target div
        $('#' + this.divTargetId).html('');

        for (let i = 0; i < data.events.length; i++) {
            const event = data.events[i];
            const markup = this._getEventMarkup.apply(this, [event]);
            $('#' + this.divTargetId).append(markup);
            window.EBWidgets.createWidget({
                widgetType: 'checkout',
                eventId: event.id,
                modal: true,
                modalTriggerElementId: `register-button-${event.id}`,
                onOrderComplete: this.onOrderComplete
            });
        }

        const pageNumbers = this._getPageNumbers(data);

        $('#' + this.divTargetId)
            .append(pageNumbers);
    }

    renderEvents() {
        const requestUrl = `https://www.eventbriteapi.com/v3/destination/organizers/${this.organizerId}/events/?token=${this.apiToken}&expand=image&time_filter=current_future&page_size=${this.pageSize}&page_number=${this.pageNumber}`;

        $.get(requestUrl,
            (data) => {

                if (!this.scriptLoaded) {
                    this._loadScript(EB_WIDGETS_SRC,
                        () => {
                            this._doRender.apply(this, [data]);
                            this.scriptLoaded = true;
                        }
                    );
                } else {
                    this._doRender.apply(this, [data]);
                }
            }
        );

    }

}
