<?php

namespace AppBundle\Controller\Admin;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use AppBundle\Document\ContentType;
use AppBundle\Document\Collection;

/**
 * Class ContentTypeController
 * @package AppBundle\Controller
 * @Route("/admin/content_types")
 */
class ContentTypeController extends StorageControllerAbstract
{

    const SYSTEM_COLLECTIONS = [
        'doctrine_increment_ids',
        'content_type',
        'field_type',
        'collection',
        'category',
        'settings',
        'orders',
        'filters',
        'files',
        'users',
        'cache',
        'order',
        'order_content'
    ];

    /**
     * @param $data
     * @param int $itemId
     * @return array
     */
    public function validateData($data, $itemId = null)
    {
        if (empty($data)) {
            return ['success' => false, 'msg' => 'Data is empty.'];
        }
        if (empty($data['title'])) {
            return ['success' => false, 'msg' => 'Title is empty.'];
        }
        if (empty($data['name'])) {
            return ['success' => false, 'msg' => 'System name is empty.'];
        }
        if (empty($data['collection'])) {
            return ['success' => false, 'msg' => 'Collection name is empty.'];
        }
        if (empty($data['fields'])) {
            return ['success' => false, 'msg' => 'Please create fields for content type.'];
        }
        if (in_array($data['collection'], self::SYSTEM_COLLECTIONS)){
            return ['success' => false, 'msg' => 'You can not save content in system collections. Please choose a different collection name.'];
        }

        if($this->checkNameExists($data['name'], $itemId)){
            return ['success' => false, 'msg' => 'System name already exists.'];
        }

        return ['success' => true];
    }

    /**
     * Create or update item
     * @param $data
     * @param string $itemId
     * @return JsonResponse
     */
    public function createUpdate($data, $itemId = null)
    {
        if (!$itemId) {
            $contentType = new ContentType();
        } else {
            $repository = $this->getRepository();
            $contentType = $repository->find($itemId);
            if (!$contentType) {
                $contentType = new ContentType();
            }
        }

        $collectionName = isset($data['collection']) ? $data['collection'] : 'products';

        $contentType
            ->setTitle($data['title'])
            ->setName($data['name'])
            ->setDescription(isset($data['description']) ? $data['description'] : '')
            ->setCollection($collectionName)
            ->setFields($data['fields'])
            ->setGroups(isset($data['groups']) ? $data['groups'] : [])
            ->setIsActive(isset($data['isActive']) ? $data['isActive'] : true);

        /** @var \Doctrine\ODM\MongoDB\DocumentManager $dm */
        $dm = $this->get('doctrine_mongodb')->getManager();
        $dm->persist($contentType);
        $dm->flush();

        //Add new collection
        $collectionRepository = $this->get('doctrine_mongodb')
            ->getManager()
            ->getRepository('AppBundle:Collection');

        $count = $collectionRepository->createQueryBuilder()
            ->field('name')->equals($collectionName)
            ->getQuery()
            ->execute()
            ->count();

        if(!$count){
            $collection = new Collection();
            $collection->setName($collectionName);
            $dm->persist($collection);
            $dm->flush();
        }

        return new JsonResponse($contentType->toArray());
    }

    /**
     * @Route("/by_name/{itemName}")
     * @Method({"GET"})
     * @param $itemName
     * @return JsonResponse
     */
    public function getItemByName($itemName)
    {
        $repository = $this->getRepository();

        $fieldType = $repository->findOneBy([
            'name' => $itemName
        ]);
        if (!$fieldType) {
            return $this->setError('Item not found.');
        }

        return new JsonResponse($fieldType->toArray(true));
    }

    /**
     * @param int $itemId
     */
    public function deleteItem($itemId)
    {
        // return parent::deleteItem($itemId); // TODO: Change
    }

    /**
     * @return \AppBundle\Repository\ContentTypeRepository
     */
    public function getRepository()
    {
        return $this->get('doctrine_mongodb')
            ->getManager()
            ->getRepository(ContentType::class);
    }
}