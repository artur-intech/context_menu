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
  end

  def test_opens_on_right_click
    find('.js-with-context-menu').right_click(x: 10, y: 10)

    menu = self.menu
    assert_opened
    assert_equal ({"visibility" => "visible", "left" => "10px", "top" => "10px"}), menu.style('visibility', 'left', 'top')
  end

  def test_closes_on_esc_key
    open
    send_keys :escape
    assert_closed
  end

  def test_closes_on_outside_click
    open
    find('body').click
    assert_closed
  end

  def test_closes_on_scroll
    open
    trigger_scrolling

    scroll_to(10, 10)

    assert_closed
  end

  def test_closes_on_resize
    open

    size = current_window.size
    current_window.resize_to(size[0] - 1, size[1] - 1)

    assert_closed
  end

  private

  def assert_opened
    assert_equal 'false', menu['hidden']
  end

  def assert_closed
    assert_equal 'true', menu['hidden']
  end

  def menu
    find(:element, "data-testid": "context-menu-shadow-host").shadow_root.find('[data-testid="menu"]')
  end

  def open
    find('.js-with-context-menu').right_click
  end

  def trigger_scrolling
    execute_script("document.querySelector('#test-area').style.marginTop = '1000px';")
  end
end
