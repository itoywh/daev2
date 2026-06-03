'use strict';
'require view';
'require fs';
'require uci';
'require rpc';
'require ui';
'require form';

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('dae'),
			fs.read('/etc/dae/config.dae').catch(function() { return ''; }),
			L.resolveDefault(rpc.declare({
				object: 'luci2.dae',
				method: 'get_status'
			})(), {})
		]);
	},

	render: function(data) {
		var uciData = data[0];
		var configContent = data[1] || '';
		var status = data[2] || {};

		var m, s, o;

		m = new form.Map('dae', _('DAE'),
			_('DAE (Direct Access Endpoint) is a lightweight and high-performance transparent proxy solution based on eBPF.'));

		// Status Section
		s = m.section(form.NamedSection, '_status');
		s.title = _('Status');
		s.anonymous = true;

		o = s.option(form.DummyValue, '_status_text');
		o.render = function(section_id) {
			var statusDiv = E('div', { class: 'cbi-section' }, [
				E('p', { id: 'dae_status' }, [
					E('em', {}, _('Collecting data...'))
				])
			]);

			// Initial status update
			var updateStatus = function() {
				rpc.declare({
					object: 'luci2.dae',
					method: 'get_status'
				})().then(function(res) {
					var el = document.getElementById('dae_status');
					if (el) {
						if (res && res.running) {
							el.innerHTML = '<em style="color:green;font-weight:bold">' + _('DAE') + ' - ' + _('RUNNING') + '</em>';
						} else {
							el.innerHTML = '<em style="color:red;font-weight:bold">' + _('DAE') + ' - ' + _('NOT RUNNING') + '</em>';
						}
					}
				});
			};

			// Poll every 5 seconds
			if (typeof this.pollInterval === 'undefined') {
				this.pollInterval = window.setInterval(updateStatus, 5000);
			}
			updateStatus();

			return statusDiv;
		};

		// Basic Settings Section
		s = m.section(form.TypedSection, 'dae', _('Basic Settings'));
		s.anonymous = true;
		s.addremove = false;

		o = s.option(form.Flag, 'enabled', _('Enable DAE'),
			_('Enable or disable the DAE service.'));
		o.default = '0';
		o.rmempty = false;

		// Actions Section
		s = m.section(form.NamedSection, '_actions');
		s.title = _('Actions');
		s.anonymous = true;

		o = s.option(form.Button, '_reload', _('Reload Service'),
			_('Restart DAE to apply configuration changes.'));
		o.inputstyle = 'apply';
		o.onclick = function() {
			return rpc.declare({
				object: 'luci2.dae',
				method: 'reload'
			})().then(function() {
				ui.addNotification(_('Service reloaded'), E('p', {}, _('DAE has been reloaded successfully.')));
			}).catch(function(e) {
				ui.addNotification(_('Error'), E('p', {}, _('Failed to reload: ') + e.message), 'error');
			});
		};

		// Configuration Editor Section
		s = m.section(form.NamedSection, '_config');
		s.title = _('Configuration Editor');
		s.anonymous = true;

		o = s.option(form.TextValue, '_config_content', _('dae.conf'),
			_('Edit the dae configuration file directly. Changes take effect after reloading.'));
		o.rows = 25;
		o.monospace = true;
		o.load = function(section_id) {
			return fs.read('/etc/dae/config.dae').catch(function() { return ''; });
		};
		o.write = function(section_id, formvalue) {
			return fs.write('/etc/dae/config.dae', formvalue || '');
		};

		return m.render();
	},

	handleSaveApply: function(ev, mode) {
		var self = this;
		return this.handleSave().then(function() {
			return rpc.declare({
				object: 'luci2.dae',
				method: 'reload'
			})();
		}).then(function() {
			ui.addNotification(_('Configuration saved'), E('p', {}, _('Configuration has been saved and service reloaded.')));
		}).catch(function(e) {
			ui.addNotification(_('Error'), E('p', {}, _('Failed to save: ') + e.message), 'error');
		});
	}
});
