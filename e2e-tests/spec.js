describe('manage permissions page::', function() {

  var userItems;

  browser.get('http://localhost:3000');

  it('should add new user with access to areas', function() {
    var areaList;
    var saveModalButton;
    var addUserButton = element(by.css('.add-new-user'));
    var userList = element.all(by.css('user-item'));

    addUserButton.click();
    //wait until modal is shown
    browser.sleep(1000);
    element(by.model('userModalDialog.user.cai')).sendKeys('TUSER3');
    element(by.css('.lookup-in-active-directory')).click();
    browser.sleep(2000);
    areaList = element.all(by.repeater('area in userModalDialog.areas'));
    areaList.get(0).element(by.css('input[type="checkbox"]')).click();
    areaList.get(1).element(by.css('input[type="checkbox"]')).click();
    saveModalButton = element(by.css('.save')).click();
    //wait until modal is hidden
    browser.sleep(1000);
    expect(userList.count()).toEqual(3);
  });

  it('should change order of users in list', function() {
    var usersSortingButton = element(by.css('.users-sorting-tool button.dropdown-toggle'));
    var usersSortingFields = element.all(by.repeater('field in usersList.fields'));
    var userItems = element.all(by.css('user-item'));

    usersSortingButton.click();
    usersSortingFields.get(1).click();

    expect(userItems.get(0).element(by.binding('userItem.user.name')).getText()).toEqual('User2');
  });

  it('should use reverse order', function() {
    var orderButton = element(by.css('button.users-sorting-tool.users-order-button'));
    var userItems = element.all(by.css('user-item'));

    orderButton.click();

    expect(userItems.get(0).element(by.binding('userItem.user.name')).getText()).toEqual('User1');
  });

  it('should filter users by query', function() {
    var userList = element.all(by.css('user-item'));

    element(by.model('usersList.searchQuery')).sendKeys('TUSER1');

    expect(userList.count()).toEqual(1);
  });

  it('should add access to one more area', function() {
    var areaList;
    var saveModalButton;
    var userItems = element.all(by.css('user-item'));
    var editPermissionsButton = element(by.css('.edit-user-permissions'));

    editPermissionsButton.click();
    browser.sleep(1000);
    areaList =  element.all(by.repeater('area in userModalDialog.areas'));
    areaList.get(2).element(by.css('input[type="checkbox"]')).click();
    browser.sleep(1000);

    expect(userItems.get(0).all(by.css('.permissions-area')).count()).toEqual(4);
  });
});
