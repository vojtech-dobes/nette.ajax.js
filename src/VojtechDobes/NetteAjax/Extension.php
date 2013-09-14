<?php

namespace VojtechDobes\NetteAjax;

use Nette\Config\CompilerExtension;


/**
 * Provides support for History API
 */
class Extension extends CompilerExtension
{

	public function loadConfiguration()
	{
		$container = $this->getContainerBuilder();

		$container->addDefinition($this->prefix('onRequestHandler'))
			->setClass('VojtechDobes\NetteAjax\OnRequestHandler');

		$container->addDefinition($this->prefix('onResponseHandler'))
			->setClass('VojtechDobes\NetteAjax\OnResponseHandler');

		$application = $container->getDefinition('application');
		$application->addSetup('$service->onRequest[] = ?', array('@' . $this->prefix('onRequestHandler')));
		$application->addSetup('$service->onResponse[] = ?', array('@' . $this->prefix('onResponseHandler')));
	}

}
