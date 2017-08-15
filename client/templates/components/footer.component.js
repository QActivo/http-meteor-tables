Template.HttpTableFooter.onCreated(function () {
  let self = this;

  self.settings = self.data.settings;
  self.selector = self.data.selector;
  self.options = self.data.options;
  self.queryResult = self.data.result;

  self.totalItems = new ReactiveVar(0);
  self.totalElems = new ReactiveVar(0);
  self.ready = new ReactiveVar(false);

  let settings = self.settings.get();
  let TABLE = Tables.registered[settings.table_id];

  self.subManager = TABLE.sub_manager ? TABLE.sub_manager : self;

  self.getTotalElems = function () {
    return self.totalElems.get();
  };

  self.autorun(function () {
    self.ready.set(false);

    Meteor.call(
      'httptables.collection.total_elems',
      TABLE.collection._name,
      self.selector.get(),
      function (err, res) {
        self.ready.set(true);

        self.totalElems.set(res);
      });
  });

  self.autorun(function () {
    self.totalItems.set(Math.min(
      self.getTotalElems(),
      settings.hard_limit
    ));
  });
});

Template.HttpTableFooter.onRendered(function () {
  let self = this;

  let settings;

  self.autorun(function () {
    settings = self.settings.get();
    
    self.$('.pagination')
      .pagination({
        items: self.totalItems.get(),
        currentPage: settings.current.page,
        itemsOnPage: settings.current.entry,
        displayedPages: 3,
        edges: 1,
        ellipsePageSet: false,
        disableAnchors: true,
        onPageClick: onPageClick
      })
      .pagination(self.ready.get() ? 'enable' : 'disable');
  });

  function onPageClick (pageNumber, e) {   
    e.preventDefault();

    settings.current.page = pageNumber;
    
    self.settings.set(settings);
  }

  self.autorun(function () {
    if (self.handle.ready()) {
      let settings = Tracker.nonreactive(() => self.settings.get());
      if (settings.current.entry >= self.getTotalElems() && settings.current.page !== 1) {
        settings.current.page = 1;
        self.settings.set(settings);
      }
    }
  });
});

Template.HttpTableFooter.helpers({
  ready: () => Template.instance().ready.get(),
  formatNumber: (number) => numeral(number).format('0,0'),
  result: () => {
    let settings = Template.instance().settings.get();

    let offsetPage = settings.current.entry * (settings.current.page - 1) + 1;
    let itemsFound = offsetPage + Template.instance().queryResult.get() - 1;

    return {
      beginPage: Math.min(offsetPage, itemsFound),
      endPage: itemsFound,
      total: Template.instance().totalItems.get()
    };
  }
})