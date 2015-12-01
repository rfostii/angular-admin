describe('manage permissions page', function() {

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
    element(by.model('userModalDialog.user.cai')).sendKeys('TUSER');
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

  it('should filter users by query', function() {
    var userList = element.all(by.css('user-item'));

    element(by.css('user-search input')).sendKeys('TUSER');

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

    expect(userItems.get(0).all(by.css('.permissions-area')).count()).toEqual(3);
  });
});
