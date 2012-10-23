<?php

namespace VojtechDobes\NetteAjax;

use Nette\Http;


/**
 * Listens for forward calls
 */
class OnRequestHandler
{

	/** @var Http\IRequest */
	private $httpRequest;

	/** @var OnResponseHandler */
	private $onResponseHandler;



	/**
	 * @param  Http\IRequest
	 * @param  OnResponseHandler
	 */
	public function __construct(Http\IRequest $httpRequest, OnResponseHandler $onResponseHandler)
	{
		$this->httpRequest = $httpRequest;
		$this->onResponseHandler = $onResponseHandler;
	}



	public function __invoke($application, $request)
	{
		if ($this->httpRequest->isAjax() && count($application->getRequests()) > 1) {
			$this->onResponseHandler->markForward();
		}
	}

}
