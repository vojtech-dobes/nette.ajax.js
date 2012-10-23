<?php

namespace VojtechDobes\NetteAjax;

use Nette\Application\Responses\ForwardResponse;
use Nette\Application\Responses\JsonResponse;
use Nette\Application\IRouter;
use Nette\Http;
use Nette\Reflection\Property;


/**
 * Automatically adds 'redirect' to payload when forward happens
 * to simplify userland code in presenters
 * Also bypasses 'redirect()' calls with 'forward()' calls
 *
 * @author Vojtěch Dobeš
 */
class OnResponseHandler
{

	/** @var Http\IRequest */
	private $httpRequest;

	/** @var IRouter */
	private $router;

	/** @var bool */
	private $forwardHasHappened = FALSE;



	/**
	 * @param  Http\IRequest
	 * @param  IRouter
	 */
	public function __construct(Http\IRequest $httpRequest, IRouter $router)
	{
		$this->httpRequest = $httpRequest;
		$this->router = $router;
	}



	/**
	 * Stores information about ocurring forward() call
	 */
	public function markForward()
	{
		$this->forwardHasHappened = TRUE;
	}



	public function __invoke($application, $response)
	{
		if ($response instanceof JsonResponse && ($payload = $response->getPayload()) instanceof \stdClass) {
			if (!$this->forwardHasHappened && isset($payload->redirect)) {
				$url = new Http\UrlScript($payload->redirect);
				$url->setScriptPath($this->httpRequest->url->scriptPath);
				$httpRequest = new Http\Request($url);

				if ($this->router->match($httpRequest) !== NULL) {
					$prop = new Property($application, 'httpRequest');
					$prop->setAccessible(TRUE);
					$prop->setValue($application, $httpRequest);

					$application->run();
					exit;
				}
			} elseif ($this->forwardHasHappened && !isset($payload->redirect)) {
				$payload->redirect = $application->getPresenter()->link('this');
			}
		}
	}

}
