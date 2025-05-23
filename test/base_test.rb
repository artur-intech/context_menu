require "bundler/inline"

gemfile do
  source "https://rubygems.org"
  gem "capybara"
  gem "minitest"
  gem "selenium-webdriver"
end

require 'minitest/autorun'
require "capybara"
require "capybara/dsl"

Capybara.register_driver :chrome do |app|
  options = Selenium::WebDriver::Options.chrome
  options.add_argument('--headless=new')
  options.add_argument('--no-sandbox')
  options.add_argument('--window-size=1400,1400')
  options.add_argument('--allow-file-access-from-files')
  options.add_argument('--disable-dev-shm-usage')
  options.add_argument("--ignore-certificate-errors")
  options.add_argument("--disable-background-timer-throttling")
  options.add_argument("--disable-gpu-compositing")
  options.add_argument('--disable-extensions')
  options.add_argument('--disable-notifications')
  options.add_argument('--disable-popup-blocking')
  options.add_argument('--disable-web-security')
  options.add_argument('--disable-site-isolation-trials')
  options.add_argument("--disable-features=GlobalMediaControls,MediaRouter,Translate")

  Capybara::Selenium::Driver.new(app, browser: :chrome, options:)
end
Capybara.current_driver = :chrome

Capybara.configure do |c|
  c.app_host = 'file://' + File.expand_path(File.dirname(__FILE__))
  c.run_server = false
  c.ignore_hidden_elements = false
  c.w3c_click_offset = false
end

class BaseTest < Minitest::Test
  include Capybara::DSL

  def setup
    visit "/app.html"
    execute_script <<-JS
      const { ContextMenu } = await import("../context_menu.mjs");
      globalThis.ContextMenu = ContextMenu;
    JS
  end

  def test_opens_on_right_click
    setup_minimal
    find('.js-with-context-menu').right_click(x: 10, y: 10)

    assert_opened
    assert_equal ({"visibility" => "visible", "left" => "10px", "top" => "10px"}), menu.style('visibility', 'left', 'top')
  end

  def test_closes_on_esc_key
    setup_minimal
    open

    send_keys :escape

    assert_closed
  end

  def test_closes_on_outside_click
    setup_minimal
    open

    find('body').click

    assert_closed
  end

  def test_closes_on_scroll
    setup_minimal
    open
    make_document_long

    scroll_to(10, 10)

    assert_closed
  end

  def test_closes_on_resize
    setup_minimal
    open

    size = current_window.size
    current_window.resize_to(size[0] - 1, size[1] - 1)

    assert_closed
  end

  def test_executes_on_close_callback
    execute_script <<-JS
      globalThis.executed = false;
      new ContextMenu({
          target: document.querySelector('.js-with-context-menu'),
          items: [{label: 'any', action: () => {}}],
          onClose: () => {
            globalThis.executed = true;
          },
      });
    JS
    open

    close

    assert evaluate_script("executed")
  end

  def test_does_not_open_when_open_condition_falsy
    execute_script <<-JS
      new ContextMenu({
          target: document.querySelector('.js-with-context-menu'),
          items: [{label: 'any', action: () => {}}],
          openCondition: () => {
            return false;
          },
      });
    JS

    open

    assert_closed
  end

  def test_opens_when_open_condition_truthy
    execute_script <<-JS
      new ContextMenu({
          target: document.querySelector('.js-with-context-menu'),
          items: [{label: 'any', action: () => {}}],
          openCondition: () => {
            return true;
          },
      });
    JS

    open

    assert_opened
  end

  def test_shifts_when_clicked_near_viewport_edge
    setup_minimal

    right_click_near_viewport_edge

    assert_opened
    edge_offset_px = 5
    expected_position_x = find('body')['scrollWidth'].to_i - menu['offsetWidth'].to_i - edge_offset_px
    expected_position_y = find('body')['scrollHeight'].to_i - menu['offsetHeight'].to_i - edge_offset_px
    assert_equal ({"visibility" => "visible", "left" => "#{expected_position_x}px",
                                              "top" => "#{expected_position_y}px"}),
                  menu.style('visibility', 'left', 'top')
  end

  def test_closes_on_outside_right_click
    setup_minimal
    make_test_area_smaller_than_document
    open

    find('body').right_click

    assert_closed
  end

  def test_executes_item_action_and_closes
    execute_script <<-JS
      globalThis.executed = false;
      new ContextMenu({
          target: document.querySelector('.js-with-context-menu'),
          items: [{label: 'Item', action: () => {
            globalThis.executed = true;
          }}]
      });
    JS
    open

    menu.find('li', text: 'Item').click

    assert evaluate_script("executed")
    assert_closed
  end

  def test_throws_exception_when_no_items_provided
    error = assert_raises Selenium::WebDriver::Error::JavascriptError do
      execute_script <<-JS
        new ContextMenu({
            target: document.querySelector('.js-with-context-menu'),
            items: []
        });
      JS
    end
    assert_match 'No items were provided. At least one is required.', error.message
  end

  def test_custom_css
    execute_script <<-JS
      new ContextMenu({
          target: document.querySelector('.js-with-context-menu'),
          items: [{label: 'Item', action: () => {}}],
          css: 'ul { content: "test" }'
      });
    JS

    open

    assert_equal '"test"', menu.style('content')['content']
  end

  private

  def assert_opened
    assert_equal 'false', menu['hidden']
  end

  def assert_closed
    assert_equal 'true', menu['hidden']
  end

  def menu
    @menu ||= find(:element, "data-testid": "context-menu-shadow-host").shadow_root.find('[data-testid="menu"]')
  end

  def open
    find('.js-with-context-menu').right_click
  end

  def make_document_long
    execute_script("document.querySelector('#test-area').style.marginTop = '1000px';")
  end

  def close
    send_keys :escape
  end

  def setup_minimal
    execute_script <<-JS
      new ContextMenu({
          target: document.querySelector('.js-with-context-menu'),
          items: [{label: 'any', action: () => {}}],
          openCondition: () => {
            return true;
          },
      });
    JS
  end

  def right_click_near_viewport_edge
    execute_script <<-JS
      const find = document.querySelector.bind(document);
      const testArea = find('#test-area');
      const event = new MouseEvent('contextmenu', {
        pageX: testArea.offsetWidth - 1,
        pageY: testArea.offsetHeight - 1,
        clientX: testArea.offsetWidth - 1,
        clientY: testArea.offsetHeight - 1
      });
      find('.js-with-context-menu').dispatchEvent(event);
    JS
  end

  def make_test_area_smaller_than_document
    execute_script <<-JS
      const testArea = document.querySelector('#test-area');
      testArea.style.width = testArea.style.height = '500px';
    JS
  end
end
